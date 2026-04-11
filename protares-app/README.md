# ProtaRes

Intelligent Emergency Response Coordination Platform — a native Android and iOS app built with Expo SDK 54, React Native, TypeScript and Supabase.

> This README is a getting-started guide for developers. The authoritative spec is [`../CLAUDE_CODE_MASTER_INSTRUCTIONS.md`](../CLAUDE_CODE_MASTER_INSTRUCTIONS.md).

## Status

Scaffold complete across all six phases of the master instructions:

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Foundation (auth, theme, ErrorBoundary) | Scaffolded |
| 2 | Core responder (profile, credentials, location) | Scaffolded |
| 3 | Emergency response (alerts, map, state machine, Corridor Algorithm) | Scaffolded |
| 4 | Witness mode (emergency report, camera stream) | Scaffolded |
| 5 | Advanced (offline queue, network status, notifications, history) | Scaffolded |
| 6 | Compliance (settings, GDPR, Edge Functions, CI/CD) | Scaffolded |

## Local development

1. Copy `.env.example` to `.env.development` and fill in Supabase / Google OAuth keys.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Regenerate the native projects after any config change:
   ```bash
   npx expo prebuild --clean
   ```
4. Run on a real device with a dev client (Google Sign-In does not work in Expo Go):
   ```bash
   npx expo run:ios
   npx expo run:android
   ```

## Critical setup: Google Sign-In

Section 4 of the master instructions is mandatory reading. In short:

- Create **three** OAuth clients in Google Cloud Console: Web, Android, iOS
- Set `webClientId` to the **Web** client ID (even on Android)
- Set `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` to the reversed iOS client ID
- Add BOTH debug and Play App Signing SHA-1 fingerprints to the Android client
- Never use `expo-auth-session` for Google OAuth — it crashes in production

## Database

Run the migration in `supabase/migrations/0001_initial_schema.sql` against a Supabase project. It enables `postgis`, `pgcrypto`, and `uuid-ossp`, creates the tables with RLS policies, and registers the `nearby_available_responders` helper used by the dispatch Edge Function.

## Tests

```bash
npm run typecheck
npm run lint
npm test
```

Unit tests live next to the code in `__tests__/` folders. The Corridor Algorithm and distance helpers have property-based tests that guard the core dispatch invariants.

## Compliance

See the master instructions §2 (NHS regulatory landscape) and §18 (DTAC compliance checklist). The scaffold includes:

- WCAG 2.2 AA design tokens in `src/config/theme.ts`
- UK GDPR export/delete flows in `supabase/functions/gdpr-*`
- PII-scrubbing Sentry setup in `src/lib/sentry.ts`
- 24-hour location retention via `cleanup-locations` Edge Function

## Next steps

1. Generate real app icons (see master §7)
2. Connect a live Supabase project and apply the migration
3. Set up Google Cloud OAuth credentials for Web/Android/iOS clients
4. Register the Expo push credentials and configure EAS
5. Replace the GMC / NMC Edge Function stubs with live API integrations
