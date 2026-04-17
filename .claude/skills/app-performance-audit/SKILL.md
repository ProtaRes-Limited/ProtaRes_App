---
name: app-performance-audit
description: Use when the user reports the ProtaRes app is slow to start, laggy on navigation, takes too long to reach the home screen, shows the splash screen for too long, or generally "can't compete" with other apps on responsiveness. This skill runs a structured cold-start investigation on the React Native / Expo codebase, measures real startup latency on a connected Android device, identifies the top bottlenecks, applies targeted fixes, and rebuilds to verify. Triggers on phrases like "app is slow", "takes forever to load", "splash screen stays too long", "make it faster", "performance issue", "startup time".
---

# ProtaRes app-performance audit

A structured playbook for finding and fixing slow cold-start and runtime lag in the ProtaRes React Native / Expo app. Always run steps in order — measurement before guesswork. Never apply a fix without a before/after number to justify it.

## Ground rules

1. **Measure first, change second.** Never assume — use `adb logcat`, JS profiler, or bundle analyser to prove where time is actually spent.
2. **One fix per rebuild cycle.** Gradle builds take 10–20 min; batching fixes defeats the ability to attribute a regression.
3. **Release build only for real numbers.** Debug builds include Metro overhead and development-only checks; they are 2–3× slower than release.
4. **Keep the old APK.** Save `app-release.apk` before each rebuild so you can A/B test if a fix makes things worse.

## Step 1 — Establish baseline cold-start time

On the connected Android device (Samsung S24+, serial via `D:/AndroidSDK/platform-tools/adb.exe devices`), measure cold-start with the built-in AM timing:

```bash
"D:/AndroidSDK/platform-tools/adb.exe" shell am force-stop com.protares.app
"D:/AndroidSDK/platform-tools/adb.exe" shell am start -W -n com.protares.app/.MainActivity
```

The `-W` flag returns `ThisTime`, `TotalTime`, `WaitTime` in milliseconds. Record `TotalTime` — that is the native-side cold-start. The JS side continues past this point until the first useful screen renders.

Then measure JS-to-interactive with logcat filter:

```bash
"D:/AndroidSDK/platform-tools/adb.exe" logcat -c
"D:/AndroidSDK/platform-tools/adb.exe" shell am start -W -n com.protares.app/.MainActivity
"D:/AndroidSDK/platform-tools/adb.exe" logcat -d ReactNativeJS:V ReactNative:V *:S | head -200
```

Look for the first `ReactNativeJS` log line — the delta from launch to that line is JS bundle load + first render.

**Targets for an emergency-response app:**
- Native cold-start (`TotalTime`): < 1500 ms
- JS first render: < 3000 ms total
- Home screen interactive: < 4000 ms total

If worse than these, continue to Step 2.

## Step 2 — Audit the cold-start critical path

Read these files in order and list every synchronous operation that runs before the first visible screen:

1. `protares-app/index.ts` — entry point, `registerRootComponent` call
2. `protares-app/app/_layout.tsx` — root layout, runs at module scope AND on mount
3. `protares-app/src/config/env.ts` — env validation (Zod schemas can be slow)
4. `protares-app/src/lib/sentry.ts` — Sentry init
5. `protares-app/src/hooks/useAuth.ts` — Supabase session hydrate
6. `protares-app/src/lib/queryClient.ts` — React Query config
7. `protares-app/src/tasks/background-location.ts` — TaskManager.defineTask
8. Any `import` at the top of `_layout.tsx` pulls its entire module graph into cold-start

For each, categorise: **blocking** (splash screen held until it finishes) vs. **deferrable** (can run after first paint).

Common offenders specific to this app:
- `GoogleSignin.configure()` — synchronous, ~50-200 ms
- `initSentry()` — synchronous native bridge call
- `@sentry/react-native/expo` auto-integration — imports on module scope
- Large lucide-react-native icon barrel imports — each icon is a separate SVG component
- `expo-router`'s typed-routes experiment — regenerates types on every start in dev but bundled in release
- `react-native-maps` being imported in a screen reachable from Home (transitively loaded)

## Step 3 — Bundle analysis

Even in release mode, bundle size drives parse + load time. Generate the bundle and check:

```bash
cd d:/Apps/ProtaRes/protares-app
npx expo export --platform android --dump-sourcemap --output-dir /tmp/bundle-audit
```

Then inspect `/tmp/bundle-audit/_expo/static/js/android/*.js` size and run source-map-explorer if available:

```bash
npx source-map-explorer /tmp/bundle-audit/_expo/static/js/android/index.*.js
```

**Red flags:**
- Total bundle > 4 MB minified → too many unused dependencies
- Any single module > 500 KB → tree-shake it (usually `lucide-react-native`, `date-fns`, full-icon imports)
- `date-fns` > 200 KB → import from `date-fns/` subpaths, not root
- Sentry + `@sentry/core` + `@sentry/utils` > 600 KB combined → acceptable trade-off for error tracking

## Step 4 — Identify and apply targeted fixes

Apply **one fix at a time**, rebuild, re-measure. Stop as soon as targets in Step 1 are met.

Priority order (highest impact first):

### A. Defer non-critical init past first paint

Move these out of module scope in `app/_layout.tsx` into a `useEffect` that runs *after* `AuthGate` mounts:
- `initSentry()` — error tracking works fine if registered 500 ms later
- `GoogleSignin.configure()` — only needed before the user taps the Sign-In button
- Background location task registration — only needed when `useLocation()` actually runs

### B. Replace barrel icon imports

Every `import { X, Y, Z } from 'lucide-react-native'` pulls the entire icon manifest. Replace with direct paths where Metro supports it, or use `babel-plugin-transform-imports` to auto-rewrite.

### C. Enable Hermes precompiled bytecode

Verify in `android/app/build.gradle` that Hermes is on and bytecode is shipped (`enableHermes: true`). Without Hermes, the JS engine is JSC and parses the bundle on every cold start. With Hermes, it loads precompiled bytecode ~5× faster.

Check `android/gradle.properties` for `hermesEnabled=true`.

### D. Lazy-load heavy screens

In Expo Router, the `(tabs)/map.tsx` screen pulls in `react-native-maps` (~1 MB native bindings). Because all tab screens are eagerly mounted, this is in the cold path. Wrap the Map screen export in `React.lazy()` + `<Suspense fallback={...}>` so it only loads when the Map tab is first focused.

### E. Trim `new ArchEnabled: true` churn

Fabric + TurboModules need every native module to be compatible. If any module forces the old bridge, startup pays a double-registration cost. Check `react-native` Perfetto trace if suspicious.

### F. Splash screen timing

In `app/_layout.tsx`, `SplashScreen.hideAsync()` runs only after `AuthGate` decides which route to show. If `useAuth` waits on a slow Supabase `getSession()` call (up to 2 s if the network is cold), the splash screen hangs.

**Fix**: call `SplashScreen.hideAsync()` as soon as the session *query* starts — don't wait for it to resolve. Show a skeleton loading state inside the app instead of a static splash.

## Step 5 — Rebuild release APK and re-measure

```bash
cd d:/Apps/ProtaRes/protares-app/android
GRADLE_OPTS="-Djava.io.tmpdir=D:/temp" ./gradlew assembleRelease -Djava.io.tmpdir=D:/temp
"D:/AndroidSDK/platform-tools/adb.exe" install -r -d app/build/outputs/apk/release/app-release.apk
```

Re-run the Step 1 measurements. Record before/after in a table. If improvement is < 20% on cold-start, the fix didn't matter — revert it and try the next priority.

## Step 6 — Document findings

Leave a short summary in the chat with:
- Before/after numbers (ms)
- Which fix produced the gain
- What was tried that didn't work (so it isn't re-tried)
- Next lowest-hanging improvement not yet attempted
