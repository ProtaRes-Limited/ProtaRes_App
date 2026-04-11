# CLAUDE CODE MASTER INSTRUCTIONS — ProtaRes v2.0

## Intelligent Emergency Response Coordination Platform

### For: Claude Code running inside VS Code (Cursor IDE)

### Stack: Expo SDK 54 · React Native 0.81 · TypeScript · Supabase · Zustand · React Query

### Target: Native Android (Google Play Store) + Native iOS (Apple App Store)

---

> **THIS APP SAVES LIVES. QUALITY OVER SPEED. NEVER SHIP BROKEN CODE.**

---

## ⚠️ CRITICAL: THIS IS NOT A WEB APP

Do NOT build a Progressive Web App (PWA), do NOT build a "save to home screen" web app.
Build a **real native mobile application** using React Native and Expo that will be compiled into:

- An **AAB** (Android App Bundle) for the Google Play Store
- An **IPA** for the Apple App Store

Every architectural decision must support native compilation via EAS Build.
Never use `expo start --web` as the primary target. The web target is irrelevant.

---

## TABLE OF CONTENTS

1. [Document Reading Order](#1-document-reading-order)
2. [NHS Regulatory Landscape](#2-nhs-regulatory-landscape)
3. [Project Bootstrap](#3-project-bootstrap)
4. [Authentication — Google Sign-In That Does Not Crash](#4-authentication--google-sign-in-that-does-not-crash)
5. [Supabase Backend Configuration](#5-supabase-backend-configuration)
6. [Design System — NHS-Aligned](#6-design-system--nhs-aligned)
7. [App Icons, Splash Screen & Store Assets](#7-app-icons-splash-screen--store-assets)
8. [Project Structure](#8-project-structure)
9. [Build Phases](#9-build-phases)
10. [Core Algorithms](#10-core-algorithms)
11. [Emergency Protocols](#11-emergency-protocols)
12. [Offline Capability & Real-Time](#12-offline-capability--real-time)
13. [Error Handling & Resilience](#13-error-handling--resilience)
14. [Security & NHS Data Protection](#14-security--nhs-data-protection)
15. [Accessibility — WCAG 2.2 AA](#15-accessibility--wcag-22-aa)
16. [Testing Strategy](#16-testing-strategy)
17. [CI/CD & Release Pipeline](#17-cicd--release-pipeline)
18. [DTAC Compliance Checklist](#18-dtac-compliance-checklist)
19. [Environment Variables](#19-environment-variables)
20. [Troubleshooting & Known Pitfalls](#20-troubleshooting--known-pitfalls)
21. [Plugin & Skill References for Claude Code](#21-plugin--skill-references-for-claude-code)

---

## 1. DOCUMENT READING ORDER

Read these companion documents in this exact order. Each builds on the last:

| Order | Document | Purpose |
|-------|----------|---------|
| 1 | **This file** | Setup, approach, NHS standards, auth fix |
| 2 | **APP_BLUEPRINT.md** | Complete feature specification |
| 3 | **DESIGN_SYSTEM.md** | UI/UX guidelines |
| 4 | **DATABASE_SCHEMA.sql** | Supabase PostgreSQL schema (PostGIS, pgcrypto, RLS) |
| 5 | **PRIVACY_AND_COMPLIANCE.md** | GDPR, NHS DSPT, lawful basis |
| 6 | **STATE_AND_SERVICES.md** | State management and API service layer |
| 7 | **COMPONENT_LIBRARY.md** | Reusable React Native components |
| 8 | **USER_FLOWS.md** | Screen flows and user journeys |
| 9 | **FORMS_AND_VALIDATION.md** | Zod schemas and react-hook-form config |
| 10 | **CONFIG_AND_SETUP.md** | Environment and build config (use as reference but defer to THIS file for auth) |
| 11 | **NOTIFICATIONS_AND_ANALYTICS.md** | Push notifications, analytics events |
| 12 | **EMERGENCY_PROTOCOLS.md** | Emergency dispatch logic, escalation rules |
| 13 | **INTEGRATION_SPECS.md** | Third-party APIs (GMC, NMC, Twilio, TfL) |
| 14 | **PROTARES_PRODUCTION_UPGRADE.md** | Production audit checklist (11 domains) |

---

## 2. NHS REGULATORY LANDSCAPE

ProtaRes is a Digital Health Technology (DHT) intended for use within and alongside NHS services in England. Before writing a single line of code, understand the regulatory obligations.

### 2.1 DTAC — Digital Technology Assessment Criteria

The DTAC is the **national baseline** for digital health technologies entering the NHS. As of February 2026, NHS England has revised the DTAC form with a 25% reduction in questions. DTAC has five pillars:

1. **Clinical Safety** — Comply with DCB0129 (manufacturer) and DCB0160 (deployer). Appoint a Clinical Safety Officer (CSO) who holds current GMC or NMC registration and has clinical risk management training. Produce a Clinical Safety Case Report (CSCR) and Clinical Risk Management Plan.
2. **Data Protection** — UK GDPR compliance, Data Protection Impact Assessment (DPIA), ICO registration, appointed Data Protection Officer (DPO), compliance with the Caldicott Principles and 10 Data Security Standards.
3. **Technical Security** — Cyber Essentials certification (minimum), annual penetration testing, secure development lifecycle, encryption at rest and in transit.
4. **Interoperability** — Use open standards (FHIR, SNOMED CT, NHS Number format). Data must be portable and shareable.
5. **Usability & Accessibility** — Meet WCAG 2.2 Level AA minimum. Follow the NHS digital service manual design patterns. Accessibility statement published.

### 2.2 DCB0129 — Clinical Risk Management

This standard is mandated under the Health and Social Care Act 2012 for all health IT system manufacturers. It requires:

- A **Clinical Risk Management System** documented and maintained
- A **Clinical Safety Officer** (CSO) — must be a senior clinician with current professional registration (GMC/NMC/HCPC) and training in clinical risk management
- A **Hazard Log** using structured methods (FFA, HAZID, SWIFT, Fishbone)
- A **Clinical Safety Case Report** (CSCR) — a structured argument that the system is safe for release
- Risk assessment at every phase of the product lifecycle
- DCB0129 is currently under review by NHS England (focus groups completed early 2025, DCB0160 review in progress)

**ProtaRes classification:** Coordination platform, NOT a medical device. Responders act as Good Samaritans. This classification must be maintained — the app must never provide clinical advice, diagnose conditions, or recommend treatments.

### 2.3 NHS DSPT — Data Security and Protection Toolkit

Required for any system that processes NHS data or integrates with NHS services. The DSPT is migrating to the Cyber Assessment Framework (CAF) — this rollout started with NHS Trusts in 2024-25, large IT suppliers in 2025-26, and all organisations by 2026-27.

The 10 Data Security Standards apply. See PRIVACY_AND_COMPLIANCE.md and PROTARES_PRODUCTION_UPGRADE.md Section 11 for the full evidence portfolio.

### 2.4 NHS Identity & Brand

ProtaRes is NOT an NHS product. Do NOT use the NHS logo or claim NHS endorsement. However, the app must visually align with NHS ecosystem expectations because it will be used by NHS-employed responders and integrated with NHS services.

Rules:
- Use NHS Blue (#005EB8) as primary colour to signal healthcare alignment
- Use the NHS digital service manual colour palette and contrast guidance as a baseline
- Typography: Use system sans-serif fonts (San Francisco on iOS, Roboto on Android) — these are the platform equivalents of Frutiger/Arial which the NHS specifies for print/web. Frutiger is the NHS brand typeface but is not licensed for third-party app use.
- Emergency red: #DA291C (NHS Emergency Services red)
- Success green: #009639
- All colour combinations must meet WCAG 2.2 AA contrast minimums (4.5:1 for normal text, 3:1 for large text and UI components)

---

## 3. PROJECT BOOTSTRAP

### 3.1 Create the Expo Project

```bash
npx create-expo-app@latest protares-app --template expo-template-blank-typescript
cd protares-app
```

### 3.2 Install Dependencies — In This Order

**Navigation:**
```bash
npx expo install expo-router react-native-screens react-native-safe-area-context
```

**Styling:**
```bash
npm install nativewind tailwindcss
npx tailwindcss init
```

**State Management:**
```bash
npm install zustand @tanstack/react-query
```

**Supabase:**
```bash
npm install @supabase/supabase-js expo-sqlite
```

**Forms:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Maps & Location:**
```bash
npx expo install expo-location react-native-maps
```

**Notifications:**
```bash
npx expo install expo-notifications expo-device
```

**Camera & Media (Witness Mode):**
```bash
npx expo install expo-camera expo-av expo-media-library
```

**Secure Storage:**
```bash
npx expo install expo-secure-store
```

**Authentication — Google Sign-In (NATIVE, NOT expo-auth-session):**
```bash
npm install @react-native-google-signin/google-signin
```

**UI Libraries:**
```bash
npm install lucide-react-native react-native-svg
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
npm install react-native-qrcode-svg
```

**Utilities:**
```bash
npx expo install expo-constants expo-linking expo-status-bar expo-local-authentication
npm install date-fns lodash
npm install -D @types/lodash
```

**Error Tracking:**
```bash
npx expo install @sentry/react-native
```

**Animations:**
```bash
npx expo install react-native-reanimated
```

### 3.3 Packages to NEVER Use

| Package | Why | Use Instead |
|---------|-----|-------------|
| `expo-auth-session` (for Google) | Crashes on iOS redirect, breaks in production EAS builds, token exchange fails on Android post-SDK 53 | `@react-native-google-signin/google-signin` |
| `expo-google-app-auth` | Deprecated | `@react-native-google-signin/google-signin` |
| `react-native-app-auth` | Adds unnecessary complexity | `@react-native-google-signin/google-signin` |
| `AsyncStorage` (for auth tokens) | Not encrypted, fails NHS DSPT security requirements | `expo-secure-store` |
| `expo-web-browser` (for OAuth) | Fragile redirect handling, fails in production builds | `@react-native-google-signin/google-signin` |

---

## 4. AUTHENTICATION — GOOGLE SIGN-IN THAT DOES NOT CRASH

This is the single most important section. Every previous build has crashed because of incorrect Google Sign-In configuration. Follow these steps EXACTLY.

### 4.1 Architecture

The authentication flow uses TWO methods:

1. **Email + Password** — via Supabase Auth (signUp / signInWithPassword)
2. **Google Sign-In** — via native `@react-native-google-signin/google-signin` library, then passing the `idToken` to Supabase `signInWithIdToken`

Both methods produce the same Supabase session. The user ends up in the same `auth.users` table regardless of method.

### 4.2 Why It Crashes — Root Causes

| Cause | Symptom | Fix |
|-------|---------|-----|
| Using `expo-auth-session` for Google OAuth | iOS cannot return from redirect; Android token exchange fails in production | Use native `@react-native-google-signin/google-signin` |
| Missing `iosUrlScheme` in Expo config plugin | iOS crash on sign-in button tap — "Exception: Missing URL scheme" | Add reversed iOS client ID as `iosUrlScheme` |
| Using only Android Client ID | Silent failure — Google picker appears then nothing happens | You MUST create Web + Android + iOS OAuth Client IDs in Google Cloud Console |
| Wrong `webClientId` in GoogleSignin.configure() | `idToken` is null, Supabase rejects it | Use the **Web** Client ID (not Android or iOS) for `webClientId` |
| Missing SHA-1 fingerprint for Android | Works in dev, silently fails in Play Store build | Add BOTH debug AND production SHA-1 to Google Cloud Android Client |
| `detectSessionInUrl: true` in Supabase client | Interferes with deep linking, causes white screen on app launch | Set `detectSessionInUrl: false` for React Native |
| Not calling `GoogleSignin.configure()` before render | Race condition crash on app startup | Call `configure()` in root `_layout.tsx` before any component renders |
| `expo-auth-session` and `@react-native-google-signin` both installed | Conflicting URL scheme handlers cause iOS crash | Only install ONE — use `@react-native-google-signin/google-signin` |

### 4.3 Google Cloud Console Setup (Step by Step)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project called "ProtaRes"
3. Navigate to **APIs & Services → OAuth Consent Screen**
   - App name: "ProtaRes"
   - User support email: chisom@protares.co.uk
   - Authorized domains: `protares.co.uk`, `<your-project-ref>.supabase.co`
   - Scopes: `email`, `profile`, `openid`
4. Create **THREE** OAuth Client IDs under **APIs & Services → Credentials**:

**Client A — Web Application (REQUIRED — Supabase needs this)**
- Type: Web application
- Name: "ProtaRes Web Client"
- Authorized redirect URIs: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
- Save the **Client ID** and **Client Secret** — these go into Supabase Dashboard

**Client B — Android**
- Type: Android
- Package name: `com.protares.app` (must match `android.package` in app.config.js)
- SHA-1 fingerprint — get from:
  - Debug: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`
  - Production (EAS): run `eas credentials` → select Android → view existing credentials, or `keytool -list -v -keystore /path/to/upload-keystore.jks`
  - **ADD BOTH** debug and production SHA-1 fingerprints

**Client C — iOS**
- Type: iOS
- Bundle ID: `com.protares.app` (must match `ios.bundleIdentifier` in app.config.js)
- Save the **iOS Client ID** — you will need it for `iosClientId` config
- Note the **iOS URL Scheme** — it is the reversed client ID (e.g., `com.googleusercontent.apps.XXXX`)

5. In **Supabase Dashboard → Authentication → Providers → Google:**
   - Enable Google
   - Paste **Web Client ID** and **Web Client Secret**
   - The callback URL shown (`https://<ref>.supabase.co/auth/v1/callback`) should already be in your Web Client redirect URIs

### 4.4 app.config.js — Auth Plugin Configuration

```javascript
plugins: [
  'expo-router',
  [
    '@react-native-google-signin/google-signin',
    {
      iosUrlScheme: 'com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_REVERSED'
      // This is the iOS URL Scheme from Google Cloud Console
      // Format: reverse the iOS Client ID
    }
  ],
  // ... other plugins
],
```

**CRITICAL:** The `iosUrlScheme` MUST be set. Without it, iOS will crash when the Google Sign-In button is tapped.

### 4.5 Supabase Client Initialisation

```typescript
// src/services/supabase.ts
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,           // Uses expo-sqlite localStorage polyfill
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,        // CRITICAL: Must be false for React Native
  },
});
```

**Why `detectSessionInUrl: false`?** In React Native, there is no browser URL bar. If this is `true`, the Supabase client tries to parse the app's deep link URL on every launch, which can cause white screens, infinite loops, or crashes.

### 4.6 Google Sign-In Configuration — Called Once at App Root

```typescript
// app/_layout.tsx (or wherever your root layout lives)
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Call ONCE, BEFORE any component renders
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,  // Web Client ID (NOT Android)
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,  // iOS Client ID
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
});
```

### 4.7 Sign-In Function

```typescript
// src/services/auth.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function signInWithGoogle() {
  try {
    // Check Play Services on Android
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    // Native Google Sign-In — returns idToken
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult?.data?.idToken;

    if (!idToken) {
      throw new Error('Google Sign-In succeeded but no idToken was returned');
    }

    // Pass idToken to Supabase — this creates/links the user
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    return data;

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const googleError = error as { code: string };
      if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — not an error
        return null;
      }
      if (googleError.code === statusCodes.IN_PROGRESS) {
        // Sign-in already in progress
        return null;
      }
      if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available. Please update.');
      }
    }
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, metadata: {
  first_name: string;
  last_name: string;
  phone?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // User may not have signed in with Google — ignore
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### 4.8 Common Mistakes to Avoid

1. **NEVER put Android Client ID in `webClientId`** — the `webClientId` parameter takes the **Web** OAuth Client ID, even on Android. Google uses the Web Client ID to generate the `idToken`.
2. **NEVER omit `iosClientId`** — Android ignores it, but iOS requires it.
3. **NEVER use `signInWithOAuth` for native React Native** — that is for web browsers. Use `signInWithIdToken`.
4. **NEVER call `GoogleSignin.signIn()` without first calling `GoogleSignin.configure()`** — this causes an immediate crash.
5. **ALWAYS run `npx expo prebuild` after adding the `@react-native-google-signin/google-signin` plugin** — this regenerates the native iOS and Android projects with the correct URL schemes.
6. **ALWAYS test on a REAL DEVICE or EAS development build** — Google Sign-In does NOT work in Expo Go because it requires custom native code.
7. **When building for Play Store, add the upload key SHA-1 AND the Play App Signing SHA-1** — Google Play re-signs your app. Get the Play App Signing SHA-1 from Play Console → Release → Setup → App Signing.

### 4.9 Post-Auth: Creating the Responder Profile

After successful authentication (either method), check if a `responders` row exists for this `auth.uid()`. If not, create one. This handles first-time sign-up via Google (where there is no separate "register" step).

```typescript
// In your auth state listener or post-login hook
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: profile } = await supabase
    .from('responders')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // First login — create responder profile
    await supabase.from('responders').insert({
      id: user.id,
      email: user.email!,
      first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
      last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      tier: 'tier4_witness',  // Default until credentials verified
    });
  }
}
```

---

## 5. SUPABASE BACKEND CONFIGURATION

### 5.1 Project Setup

- Create a Supabase project at [supabase.com](https://supabase.com)
- Enable the following extensions in the SQL editor:
  - `uuid-ossp` — UUID generation
  - `postgis` — geospatial queries (critical for nearby responder lookup)
  - `pgcrypto` — encryption for credential numbers
- Run the full schema from `DATABASE_SCHEMA.sql`

### 5.2 Auth Configuration in Supabase Dashboard

Under **Authentication → URL Configuration:**
- Site URL: `protares://` (your app's deep link scheme)
- Redirect URLs: Add `protares://`, `protares://google-auth`, `exp://localhost:8081` (for dev)

Under **Authentication → Providers:**
- Email: Enabled, with confirm email ON
- Google: Enabled, with Web Client ID + Secret from Google Cloud Console
- Phone (optional): Enable for SMS OTP via Twilio

### 5.3 Row Level Security

RLS MUST be enabled on ALL tables. See DATABASE_SCHEMA.sql for the complete policy set. Critical rules:

- `responders`: Users see only their own profile. Service role for dispatch functions.
- `credentials`: Users see only their own. Hashed credential numbers never exposed in SELECT.
- `emergencies`: Authenticated users see active emergencies only.
- `location_history`: Users see only their own. 24-hour auto-expiry enforced via pg_cron.
- `audit_log`: Admin/super-admin only.
- `consent_records`: Append-only — no UPDATE or DELETE allowed.

### 5.4 Edge Functions

Create Supabase Edge Functions for server-side operations:

- `verify-gmc` — GMC API credential verification
- `verify-nmc` — NMC API credential verification
- `generate-green-badge` — Signed, time-limited QR code generation
- `dispatch-alert` — Find nearby responders, apply Corridor Algorithm, send push notifications
- `cleanup-locations` — Hourly cron to delete expired location history
- `gdpr-export` — Package user data for GDPR export
- `gdpr-delete` — 30-day grace period account deletion

---

## 6. DESIGN SYSTEM — NHS-ALIGNED

### 6.1 Colour Palette

The primary colour is NHS Blue. All colours are mapped in tailwind.config.js:

```
NHS Blue (Primary):        #005EB8
NHS Dark Blue:             #003087
NHS Bright Blue:           #0072CE
NHS Light Blue:            #41B6E6
NHS Aqua Blue:             #00A9CE

NHS White:                 #FFFFFF
NHS Pale Grey:             #F0F4F5
NHS Grey 1:                #D8DDE0
NHS Grey 2:                #AEB7BD
NHS Grey 3:                #768692
NHS Grey 4:                #425563
NHS Black:                 #231F20

Emergency Red:             #DA291C
NHS Warm Yellow:           #FFB81C
NHS Green (success):       #009639
NHS Dark Green:            #006747
NHS Purple:                #330072
NHS Dark Pink:             #7C2855
NHS Orange:                #ED8B00

Background tint:           #F0F4F5 (not pure white — NHS recommendation for dyslexia)
Text primary:              #212B32 (NHS dark text, not pure black)
Text secondary:            #4C6272
```

### 6.2 Contrast Compliance

ALL text/background combinations MUST meet WCAG 2.2 AA minimums:

| Combination | Ratio Required | Test With |
|-------------|---------------|-----------|
| Normal text (< 18px) on background | 4.5:1 minimum | WebAIM Contrast Checker |
| Large text (≥ 18px or ≥ 14px bold) on background | 3:1 minimum | |
| UI components (buttons, inputs, icons) against adjacent colours | 3:1 minimum | |
| Focus indicators | 3:1 against both background and unfocused state | |

Known SAFE combinations:
- #212B32 text on #FFFFFF → 14.4:1 (AAA)
- #212B32 text on #F0F4F5 → 12.8:1 (AAA)
- #FFFFFF text on #005EB8 → 4.96:1 (AA)
- #FFFFFF text on #DA291C → 4.57:1 (AA)
- #FFFFFF text on #009639 → 4.58:1 (AA)

Known UNSAFE combinations (DO NOT USE):
- #005EB8 text on #F0F4F5 → may fail on some screens
- #AEB7BD text on #FFFFFF → fails AA
- #FFB81C text on #FFFFFF → fails AA

### 6.3 Typography

Use system fonts. Do NOT import custom fonts — this keeps bundle size small and respects platform conventions:

```javascript
// tailwind.config.js
fontFamily: {
  sans: ['System'],  // Resolves to San Francisco (iOS) / Roboto (Android)
},
```

Scale (matches NHS digital service manual proportionally):

| Usage | Size | Weight |
|-------|------|--------|
| Display / Large Title | 32px | Bold (700) |
| Heading 1 | 24px | Bold (700) |
| Heading 2 | 20px | Bold (700) |
| Heading 3 | 18px | Semibold (600) |
| Body / Default | 16px | Regular (400) |
| Body Small | 14px | Regular (400) |
| Caption / Label | 12px | Medium (500) |

### 6.4 Touch Targets

WCAG 2.2 Success Criterion 2.5.8 (Target Size — Minimum) requires interactive targets of at least 24×24 CSS pixels, with adequate spacing. The NHS goes further:

- **Minimum touch target: 44×44 points** (Apple HIG) / **48×48 dp** (Material Design)
- Emergency action buttons (Accept Emergency, Call 999): **minimum 56px height**
- Space between adjacent tap targets: minimum 8px

### 6.5 Emergency UI States

Emergency-related screens use a distinct visual language:

- Background: Emergency Red (#DA291C) gradient
- Text: White on red
- Pulsing animation on critical alerts
- Maximum font size for critical info (emergency type, ETA, location)
- 999 call button ALWAYS visible — never hidden behind scrolling or modals

---

## 7. APP ICONS, SPLASH SCREEN & STORE ASSETS

### 7.1 App Icon

Generate a ProtaRes app icon that:
- Uses NHS Blue (#005EB8) as background
- Features a white ProtaRes symbol (suggest: a location pin merged with a medical cross/pulse line)
- Has NO text in the icon (text is illegible at small sizes)
- Follows Apple Human Interface Guidelines (no transparency, rounded corners handled by OS)
- Follows Material Design adaptive icon guidelines (foreground + background layers)

**Required assets:**

```
assets/
├── icon.png                     # 1024×1024 (iOS App Store)
├── adaptive-icon-foreground.png # 1024×1024 with safe zone (Android adaptive)
├── adaptive-icon-background.png # 1024×1024 solid NHS Blue
├── notification-icon.png        # 96×96, white on transparent (Android notification)
├── splash-icon.png              # 512×512 or larger (Expo splash)
```

Use `@expo/config-plugins` or create these with a vector tool. Do NOT use placeholder icons — generate production-quality assets using the ProtaRes brand identity.

### 7.2 Splash Screen

```javascript
// app.config.js
splash: {
  image: './assets/splash-icon.png',
  resizeMode: 'contain',
  backgroundColor: '#005EB8',  // NHS Blue
},
```

The splash screen should feel medical and professional:
- NHS Blue background (#005EB8)
- White ProtaRes logo centred
- Clean, no text (the OS shows the app name below on some platforms)

### 7.3 Store Listing Assets

Prepare these for Google Play and App Store submissions:

| Asset | Google Play | App Store |
|-------|------------|-----------|
| Feature graphic | 1024×500 | N/A |
| Screenshots | Min 2, max 8 per device type | Min 3, max 10 |
| Short description | Max 80 chars | Max 30 chars (subtitle) |
| Full description | Max 4000 chars | Max 4000 chars |
| Privacy policy URL | Required | Required |
| App icon | 512×512 | 1024×1024 |

---

## 8. PROJECT STRUCTURE

```
protares-app/
├── app/                          # Expo Router file-based screens
│   ├── (auth)/                   # Unauthenticated screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # Email + Google Sign-In
│   │   ├── register.tsx          # Email signup
│   │   ├── forgot-password.tsx
│   │   └── onboarding.tsx        # First-launch onboarding
│   ├── (tabs)/                   # Main authenticated tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home dashboard
│   │   ├── alerts.tsx            # Active emergency alerts
│   │   ├── map.tsx               # Map view
│   │   ├── history.tsx           # Response history
│   │   └── profile.tsx           # Profile & settings
│   ├── emergency/                # Emergency response flow
│   │   ├── [id].tsx
│   │   ├── respond.tsx
│   │   ├── navigate.tsx
│   │   ├── on-scene.tsx
│   │   ├── handover.tsx
│   │   └── witness-mode.tsx
│   ├── credentials/
│   │   ├── index.tsx
│   │   ├── verify.tsx
│   │   └── green-badge.tsx
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── availability.tsx
│   │   ├── notifications.tsx
│   │   ├── privacy.tsx
│   │   └── data-export.tsx
│   ├── _layout.tsx               # Root layout — GoogleSignin.configure() goes HERE
│   └── index.tsx                 # Entry redirect (check auth state)
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Card, Input, Badge, Toast, etc.
│   │   ├── emergency/            # EmergencyCard, AlertBanner, CountdownTimer
│   │   ├── map/                  # MapView, ResponderMarker, EmergencyMarker
│   │   ├── credentials/          # GreenBadge, CredentialCard, QRDisplay
│   │   ├── forms/                # FormField, PhoneInput, CredentialInput
│   │   └── ErrorBoundary.tsx     # App-wide error boundary with Sentry
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEmergencies.ts
│   │   ├── useLocation.ts
│   │   ├── useProfile.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useRealtimeEmergency.ts
│   │   └── useNotificationListeners.ts
│   ├── services/
│   │   ├── supabase.ts           # Supabase client (localStorage, detectSessionInUrl: false)
│   │   ├── auth.ts               # signInWithGoogle, signInWithEmail, signUp, signOut
│   │   ├── emergencies.ts        # Emergency CRUD
│   │   ├── responders.ts         # Profile, availability, location updates
│   │   ├── credentials.ts        # GMC/NMC verification
│   │   ├── notifications.ts      # Push token registration, notification handling
│   │   └── location.ts           # Location tracking start/stop/update
│   ├── stores/                   # Zustand stores
│   │   ├── auth.ts
│   │   ├── location.ts
│   │   ├── emergency.ts
│   │   └── settings.ts
│   ├── lib/
│   │   ├── corridor-algorithm.ts # Trajectory prediction (patent-pending)
│   │   ├── transport-classifier.ts # Transport mode detection (patent-pending)
│   │   ├── distance.ts           # Haversine, ETA calculations
│   │   ├── encryption.ts         # AES-256-GCM for credential numbers
│   │   ├── error-messages.ts     # User-friendly error mapping
│   │   ├── constants.ts          # App-wide constants
│   │   └── offline-queue.ts      # Mutation queue for offline mode
│   ├── types/
│   │   ├── database.types.ts     # Auto-generated from Supabase
│   │   ├── emergency.ts
│   │   ├── responder.ts
│   │   ├── credentials.ts
│   │   ├── errors.ts             # Typed error hierarchy
│   │   └── index.ts
│   ├── schemas/                  # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── emergency.ts
│   │   ├── credentials.ts
│   │   └── profile.ts
│   └── config/
│       ├── theme.ts              # Design tokens
│       └── env.ts                # Environment validation
├── assets/
│   ├── icon.png
│   ├── adaptive-icon-foreground.png
│   ├── adaptive-icon-background.png
│   ├── splash-icon.png
│   ├── notification-icon.png
│   └── sounds/
│       └── emergency_alert.wav   # Custom emergency notification sound
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── functions/                # Edge Functions
│       ├── verify-gmc/
│       ├── verify-nmc/
│       ├── dispatch-alert/
│       ├── generate-green-badge/
│       ├── gdpr-export/
│       └── gdpr-delete/
├── __tests__/                    # Test files
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI/CD
├── app.config.js
├── tailwind.config.js
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── eas.json
├── global.css
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
└── package.json
```

---

## 9. BUILD PHASES

### Phase 1: Foundation (Days 1-3)

- [ ] Create Expo project with all dependencies (Section 3)
- [ ] Set up file structure (Section 8)
- [ ] Configure tailwind.config.js with NHS colour palette (Section 6)
- [ ] Configure app.config.js with all plugins, permissions, bundle identifiers
- [ ] Configure eas.json with development, preview, production profiles
- [ ] Configure tsconfig.json with strict mode and path aliases
- [ ] Implement Supabase client with correct auth settings (Section 4.5)
- [ ] Implement Google Sign-In configuration (Section 4.6)
- [ ] Implement email/password auth (Section 4.7)
- [ ] Implement auth state listener and responder profile creation (Section 4.9)
- [ ] Build auth screens: Login, Register, Forgot Password
- [ ] Build root layout with navigation guards (redirect based on auth state)
- [ ] Create ErrorBoundary component
- [ ] Run `npx expo prebuild` and test on real device via `eas build --profile development`

### Phase 2: Core Responder (Days 4-6)

- [ ] Supabase schema deployment (run DATABASE_SCHEMA.sql)
- [ ] Responder profile screen (view/edit)
- [ ] Location tracking service (foreground + background)
- [ ] Availability toggle (on/off duty)
- [ ] Credential verification flow (GMC/NMC input, Edge Function verification)
- [ ] Green Badge display with dynamic QR code
- [ ] Notification permission request and push token registration

### Phase 3: Emergency Response (Days 7-10)

- [ ] Emergency alert card component
- [ ] Real-time emergency subscription (Supabase Realtime)
- [ ] Accept/decline emergency flow with 60-second countdown
- [ ] Navigation to scene (Google Maps integration)
- [ ] On-scene status updates (en_route → on_scene → intervening → completing)
- [ ] Handover to EMS flow
- [ ] Implement Corridor Algorithm (trajectory prediction)
- [ ] Implement Transport Mode Classifier

### Phase 4: Witness Mode (Days 11-13)

- [ ] Emergency reporting screen for witnesses
- [ ] Camera integration for live video streaming
- [ ] Equipment request system
- [ ] Guidance relay from dispatch
- [ ] Scene assessment view

### Phase 5: Advanced Features (Days 14-16)

- [ ] Multi-agency coordination view
- [ ] Response history and personal statistics
- [ ] Low-network resilience (SMS fallback via Twilio)
- [ ] Offline mutation queue with auto-sync
- [ ] Network status banner

### Phase 6: Compliance & Polish (Days 17-20)

- [ ] GDPR data export (in-app download)
- [ ] GDPR account deletion (30-day grace period)
- [ ] Privacy settings and consent management
- [ ] Accessibility audit (WCAG 2.2 AA — see Section 15)
- [ ] Performance optimisation (Hermes, React.memo, lazy loading)
- [ ] Sentry error tracking configuration
- [ ] Final EAS production build and store submission

---

## 10. CORE ALGORITHMS

### 10.1 Corridor Algorithm™ (Patent-Pending)

See `EMERGENCY_PROTOCOLS.md` and implement in `src/lib/corridor-algorithm.ts`.

The algorithm predicts where responders will be based on current trajectory. It extends the effective alert range beyond a simple radius by considering transport routes.

Inputs: Responder location history (last N points), transport mode, known routes (bus lines, train lines), time of day.

Output: Predicted future positions at 1-minute intervals for the next 10 minutes, with confidence scores.

### 10.2 Transport Mode Classifier™ (Patent-Pending)

See `APP_BLUEPRINT.md` Section 3.2 and implement in `src/lib/transport-classifier.ts`.

Uses speed, acceleration patterns, and route matching to classify: stationary, walking, cycling, bus, train, driving.

### 10.3 Alert Prioritisation

When an emergency is reported:
1. Find all responders within 10-minute travel time using PostGIS `ST_DWithin`
2. Apply Corridor Algorithm to predict arrivals
3. Filter by responder tier (match to emergency type)
4. Sort by: ETA (primary), credential level (secondary), historical response rate (tertiary)
5. Alert top 5–10 responders simultaneously
6. First to accept gets assigned
7. If no response in 2 minutes: expand radius
8. If no response in 5 minutes: alert Tier 4 witnesses
9. Emergency services (999) ALWAYS notified in parallel — ProtaRes supplements, never replaces

---

## 11. EMERGENCY PROTOCOLS

See `EMERGENCY_PROTOCOLS.md` for full dispatch logic, escalation rules, status transitions, and handover procedures.

Key state machine:

```
reported → dispatched → responder_en_route → responder_on_scene →
ems_en_route → ems_on_scene → handover_complete → resolved
```

Alternative paths: `cancelled`, `no_response`

Every transition must be logged in the `audit_log` table with timestamp and user ID.

---

## 12. OFFLINE CAPABILITY & REAL-TIME

### 12.1 Real-Time

Use Supabase Realtime for:
- Active emergency updates (new emergencies, status changes)
- Responder location broadcasts during active response
- Dispatch coordination

Implement automatic reconnection with exponential backoff. See `PROTARES_PRODUCTION_UPGRADE.md` Section 4 for detailed reconnection logic.

### 12.2 Offline

- Cache user profile, credentials, and nearby equipment locations using React Query persistence
- Queue location updates, status changes, and emergency reports when offline
- Persist queue to AsyncStorage (survives app restart)
- Auto-sync on network restore
- Display "Offline — updates pending" banner

---

## 13. ERROR HANDLING & RESILIENCE

The app must NEVER crash during an active emergency. See `PROTARES_PRODUCTION_UPGRADE.md` Section 2 for the full checklist.

Key requirements:

- React Error Boundary wrapping entire app — shows user-friendly screen with 999 call button
- Sentry integration with PII filtering (strip coordinates from breadcrumbs)
- Retry logic: emergency-related calls retry indefinitely with 2s interval
- All API errors mapped to user-friendly messages in `src/lib/error-messages.ts`
- Toast notifications for recoverable errors
- Global unhandled promise rejection handler

---

## 14. SECURITY & NHS DATA PROTECTION

See `PRIVACY_AND_COMPLIANCE.md` and `PROTARES_PRODUCTION_UPGRADE.md` Section 3.

Key requirements:

- `expo-secure-store` for all auth tokens and credential hashes (NOT AsyncStorage)
- Zod validation on ALL user input before any API call
- Credential numbers (GMC/NMC) encrypted with AES-256-GCM before storage
- Green Badge QR regenerates every 60 seconds with cryptographic nonce
- Rate limiting on auth (5/15min), credential verification (5/hour), emergency reports (3/5min)
- Biometric unlock for re-entry, Green Badge viewing, and response history
- NO PII in application logs
- GDPR data export within 7 days (automated)
- GDPR account deletion with 30-day grace period

---

## 15. ACCESSIBILITY — WCAG 2.2 AA

The NHS is legally required to meet WCAG 2.2 Level AA for public mobile apps under the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018. ProtaRes must meet this standard.

### Mobile-Specific WCAG 2.2 Criteria

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.3.4 Orientation (AA) | Support portrait and landscape | Do not lock orientation unless essential (ProtaRes locks to portrait for emergency clarity — document justification) |
| 1.4.10 Reflow (AA) | Content readable at 320px width | Test on smallest supported device |
| 1.4.11 Non-text Contrast (AA) | 3:1 for UI components | All buttons, inputs, icons |
| 2.5.1 Pointer Gestures (A) | Single-pointer alternatives | No multitouch-only actions |
| 2.5.7 Dragging Movements (AA) | Single-pointer alternatives | No drag-only interactions |
| 2.5.8 Target Size Minimum (AA) | 24×24px minimum, 44×44px recommended | All interactive elements |
| 3.3.7 Redundant Entry (A) | Don't ask for same info twice | Pre-fill from profile |

### React Native Accessibility

- Set `accessible={true}` on all interactive components
- Set `accessibilityLabel` on all buttons, icons, images
- Set `accessibilityRole` (button, link, header, image, etc.)
- Set `accessibilityState` (disabled, selected, checked)
- Set `accessibilityHint` for non-obvious actions
- Test with VoiceOver (iOS) and TalkBack (Android)
- Emergency alerts: use `accessibilityLiveRegion="assertive"` on Android, `AccessibilityInfo.announceForAccessibility()` on iOS
- Never convey information through colour alone — always pair with text, icons, or patterns

---

## 16. TESTING STRATEGY

| Type | Tool | Coverage Target |
|------|------|----------------|
| Unit (business logic) | Jest | > 80% for corridor algorithm, transport classifier, distance calculations |
| Unit (components) | React Native Testing Library | > 60% for UI components |
| Integration | Jest + MSW (Mock Service Worker) | Auth flows, emergency accept/decline |
| E2E | Detox or Maestro | Critical paths: login → accept emergency → navigate → handover |
| Accessibility | Manual (VoiceOver/TalkBack) + axe-react-native | All screens |
| Performance | Flipper + React DevTools Profiler | Emergency alert < 500ms render |
| Security | npm audit + Snyk | Zero critical/high vulnerabilities |

---

## 17. CI/CD & RELEASE PIPELINE

### GitHub Actions

```yaml
# .github/workflows/ci.yml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
    tags: ['v*']

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage

  build-preview:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --profile preview --non-interactive

  build-production:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --profile production --non-interactive
```

### EAS Build Profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": { "EXPO_PUBLIC_APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_APP_ENV": "staging" }
    },
    "production": {
      "distribution": "store",
      "env": { "EXPO_PUBLIC_APP_ENV": "production" },
      "autoIncrement": true
    }
  }
}
```

---

## 18. DTAC COMPLIANCE CHECKLIST

Build evidence for each DTAC pillar as you develop:

### Pillar 1: Clinical Safety
- [ ] Appointed Clinical Safety Officer (CSO) with GMC/NMC registration
- [ ] Clinical Risk Management Plan documented
- [ ] Hazard Log maintained (see DATABASE_SCHEMA.sql `audit_log` table)
- [ ] Clinical Safety Case Report (CSCR) produced
- [ ] Clinical hazard categories defined (see APP_BLUEPRINT hazard table)

### Pillar 2: Data Protection
- [ ] ICO registration
- [ ] Data Protection Officer (DPO) appointed
- [ ] Data Protection Impact Assessment (DPIA) completed
- [ ] Privacy Notice published (user-facing)
- [ ] Lawful basis documented for each data category
- [ ] UK GDPR rights implemented (access, erasure, portability)
- [ ] Consent management with timestamped records
- [ ] Data Processing Agreements with sub-processors (Supabase, Twilio, Google)

### Pillar 3: Technical Security
- [ ] Cyber Essentials certification
- [ ] Annual penetration test report
- [ ] Encryption at rest (Supabase, expo-secure-store) and in transit (TLS 1.2+)
- [ ] Secure development lifecycle documented
- [ ] Vulnerability scanning in CI (npm audit)
- [ ] Incident response plan documented

### Pillar 4: Interoperability
- [ ] Open data standards where applicable (FHIR-ready architecture)
- [ ] SNOMED CT coding for emergency types (future-ready)
- [ ] API documentation published
- [ ] Data portability via GDPR export

### Pillar 5: Usability & Accessibility
- [ ] WCAG 2.2 Level AA compliance
- [ ] Accessibility statement published
- [ ] User testing with diverse users including those with disabilities
- [ ] NHS digital service manual patterns followed where applicable

---

## 19. ENVIRONMENT VARIABLES

### Client-Side (.env)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Auth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key

# App
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=https://api.protares.com

# Feature Flags
EXPO_PUBLIC_ENABLE_WITNESS_MODE=true
EXPO_PUBLIC_ENABLE_SMS_FALLBACK=true
```

### Server-Side Only (Edge Functions)

```bash
SUPABASE_SERVICE_ROLE_KEY=
GMC_API_KEY=
GMC_API_URL=https://api.gmc-uk.org/v1
NMC_API_KEY=
NMC_API_URL=https://api.nmc.org.uk/v1
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+44xxxxxxxxxx
SENTRY_DSN=
RESEND_API_KEY=
```

---

## 20. TROUBLESHOOTING & KNOWN PITFALLS

| Problem | Cause | Fix |
|---------|-------|-----|
| White screen on app launch | `detectSessionInUrl: true` in Supabase client | Set to `false` |
| Google Sign-In crashes iOS | Missing `iosUrlScheme` in app.config.js plugin config | Add reversed iOS client ID |
| Google Sign-In works in dev, fails in Play Store | Missing Play App Signing SHA-1 | Add it in Google Cloud Console |
| `idToken` is null after Google Sign-In | Wrong client ID in `webClientId` — must be Web client, not Android | Use Web OAuth Client ID |
| "DEVELOPER_ERROR" on Android | SHA-1 mismatch or package name mismatch | Verify both match exactly |
| Expo Go crashes on Google Sign-In | Native module not available in Expo Go | Use `eas build --profile development` for dev builds |
| Location tracking drains battery | Updates too frequent when stationary | Use `expo-location` with activity recognition, reduce frequency when stationary |
| Push notifications not received on Android 13+ | Missing POST_NOTIFICATIONS permission | Add `RECEIVE_BOOT_COMPLETED` and request permission at runtime |
| Maps show grey tiles | Google Maps API key not configured for both iOS/Android | Enable Maps SDK for both platforms in Google Cloud Console |
| Metro bundler "sha1 mismatch" | Stale cache after plugin changes | Run `npx expo start --clear` |
| Build fails after adding google-signin | Native code not generated | Run `npx expo prebuild --clean` |

---

## 21. PLUGIN & SKILL REFERENCES FOR CLAUDE CODE

When working in VS Code with Claude Code, leverage these capabilities:

### Supabase MCP

If the Supabase MCP connector is available, use it to:
- Create and manage database tables
- Deploy Edge Functions
- View RLS policies
- Run migrations

### Available Skills to Reference

When creating deliverables beyond code, Claude Code should be aware of:

- **Frontend Design** — When building React Native components, follow the design token system and NHS colour palette rigorously
- **PDF Generation** — For generating DPIA, Clinical Safety Case Report, and other compliance documents
- **DOCX Generation** — For formal NHS compliance submissions

### Code Quality Rules for Claude Code

1. **TypeScript strict mode** — zero `any` types
2. **All Supabase queries through `src/services/` only** — never direct `supabase.from()` in components
3. **Every async operation has loading and error states** — no silent failures
4. **Every user-facing string is centralised** — prepare for future i18n
5. **Every API error mapped to a friendly message** — never show raw errors
6. **JSDoc on all public service methods** — clinical audit trail
7. **No `console.log` in production** — use Sentry for error reporting
8. **No PII in any log statement** — not even in development
9. **Commit messages reference the build phase** — e.g., "Phase 1: Implement auth flow"
10. **Run `npm run typecheck` and `npm run lint` before every commit**

---

## SUMMARY: WHAT MAKES THIS BUILD DIFFERENT

1. **Native app, not PWA** — Compiled via EAS Build for App Store and Play Store
2. **Google Sign-In that works** — Native `@react-native-google-signin/google-signin` with Supabase `signInWithIdToken`, not fragile OAuth redirects
3. **NHS DTAC compliant** — Five-pillar compliance built from the start
4. **DCB0129 clinical safety** — Hazard log, CSCR, CSO appointment
5. **WCAG 2.2 AA accessible** — Touch targets, contrast ratios, screen reader support
6. **NHS visual identity aligned** — Colour palette, typography, UI patterns
7. **Production splash screen and icons** — NHS Blue branded, store-ready
8. **Offline-first architecture** — Mutation queue, cached profiles, SMS fallback
9. **Zero-crash emergency flows** — Error boundaries, infinite retries, graceful degradation
10. **GDPR complete** — Export, delete, consent management, 24-hour location expiry

---

**Project Owner:** Chisom Ezeani
**Company:** ProtaRes Ltd
**Contact:** chisom@protares.co.uk
**DTAC queries:** england.dtac@nhs.net

---

*Document Version: 2.0.0 | Last Updated: April 2026*
*Aligned with: NHS DTAC (Feb 2026 revision), DCB0129, DCB0160, UK GDPR, WCAG 2.2 AA, NHS Digital Service Manual*
