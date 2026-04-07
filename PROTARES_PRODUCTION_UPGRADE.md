# ProtaRes Production-Grade Upgrade Skill

## Purpose
Systematically upgrade the ProtaRes emergency response coordination platform to meet NHS Digital standards, clinical governance requirements, and production reliability expectations for a life-critical application. This app coordinates emergency responders — **code quality directly impacts patient outcomes.**

## When to Use
Invoke when you want to audit and improve any area of the ProtaRes codebase against NHS, GDPR, and production-grade standards.

## Context
- **App**: ProtaRes — Intelligent Emergency Response Coordination Platform
- **Stack**: Expo SDK 54 / React Native 0.81 / TypeScript / Supabase / Zustand / React Query
- **Regulatory**: UK GDPR, NHS DSPT (Data Security & Protection Toolkit), Clinical Governance Framework
- **Classification**: NOT a medical device — coordination platform; responders act as Good Samaritans
- **Patent-Pending**: Corridor Algorithm™, Transport Mode Classifier™, Witness Mode™, Green Badge™

---

## Audit Domains

### 1. Architecture & Code Quality
**Goal**: Clean, auditable architecture that an NHS assessor or clinical governance officer can trace.

- [ ] Enforce strict service layer separation — ALL Supabase queries via `src/services/` only, never direct `supabase.from()` in components or screens
- [ ] Add barrel exports (`index.ts`) for all module directories: `components/ui/`, `stores/`, `services/`, `lib/`, `types/`, `schemas/`
- [ ] Create `src/types/errors.ts` with typed error hierarchy: `ProtaResError`, `AuthError`, `EmergencyError`, `CredentialError`, `LocationError`, `NetworkError`
- [ ] Create `src/types/database.types.ts` — regenerate from Supabase schema using `supabase gen types typescript`
- [ ] Replace all `any` types with proper interfaces (audit `services/auth.ts` and `services/emergencies.ts` transform functions)
- [ ] Enforce `Record<string, unknown>` over `Record<string, any>` everywhere
- [ ] Create `src/services/location.ts` — extract location tracking logic (currently missing as dedicated service)
- [ ] Create `src/services/notifications.ts` — extract push notification registration, listeners, channels
- [ ] Create `src/services/credentials.ts` — GMC/NMC verification API calls (currently only schemas exist)
- [ ] Create `src/hooks/` directory with custom hooks: `useEmergencies`, `useProfile`, `useLocation`, `useRealtimeEmergency`, `useNotificationListeners`
- [ ] Add JSDoc comments to all public service methods and algorithm functions (for clinical audit trail)
- [ ] Validate path alias `@/` resolves correctly in all build profiles (dev, preview, production)
- [ ] Create `src/lib/error-messages.ts` — centralised user-facing error message mapping (never show raw API errors)

### 2. Error Handling & Resilience
**Goal**: The app must NEVER crash during an active emergency response. Failures must degrade gracefully.

- [ ] Install and configure Sentry (`@sentry/react-native`) with:
  - Environment-based DSN (dev/staging/production)
  - 20% transaction sampling for performance monitoring
  - Auto-session tracking (30-second intervals)
  - PII filtering: strip location coordinates from breadcrumbs before sending
  - Custom error boundary with Sentry capture
  - Source maps uploaded on production builds
- [ ] Create `src/components/ErrorBoundary.tsx` — React error boundary wrapping entire app:
  - Captures to Sentry with component stack
  - Shows user-friendly "Something went wrong" screen with retry
  - During active emergency: shows minimal emergency info + 999 call button (never lose emergency context)
- [ ] Add retry logic with exponential backoff to ALL API calls in services:
  - Max 3 retries for non-idempotent operations (POST)
  - Max 5 retries for idempotent operations (GET)
  - Backoff: 1s, 2s, 4s, 8s, 16s (capped)
  - Emergency-related calls: retry indefinitely with 2s interval (lives depend on it)
- [ ] Configure React Query `onError` callbacks for all query/mutation hooks
- [ ] Create offline detection hook (`useNetworkStatus`) with:
  - Banner component showing "No Internet Connection — Emergency data cached"
  - Queue mutations for sync when network returns
  - Auto-retry queued mutations on reconnect
- [ ] Map ALL API errors to user-friendly messages in `src/lib/error-messages.ts`:
  - Auth: "Invalid credentials", "Email already registered", "Session expired"
  - Emergency: "Failed to report emergency — please call 999 directly"
  - Credential: "GMC number not found", "Name mismatch with register"
  - Network: "Connection lost — your data is saved and will sync automatically"
- [ ] Add global unhandled promise rejection handler (log to Sentry, never crash)
- [ ] Toast notifications for all recoverable errors with actionable messages
- [ ] During emergency response: critical actions (accept, status update, handover) must retry until success with visual feedback

### 3. Security & NHS Data Protection
**Goal**: Meet NHS DSPT requirements and GDPR obligations. Protect medical credentials, location data, and emergency records.

- [ ] Migrate sensitive tokens from AsyncStorage to `expo-secure-store`:
  - Supabase session tokens (access + refresh)
  - Any cached credential hashes
  - Device-specific encryption keys
- [ ] Validate ALL user input with Zod schemas BEFORE any API call (already partially done — audit completeness)
- [ ] Audit Supabase Row Level Security (RLS) on all 11 tables:
  - `responders`: Users see own profile only; service role for dispatch
  - `credentials`: Users see own only; hashed numbers never exposed in queries
  - `emergencies`: Authenticated users see active only; reported_by filter for own
  - `responses`: Users see own responses; service role for dispatch assignment
  - `location_history`: Users see own only; 24-hour auto-expiry enforced
  - `equipment_locations`: All authenticated users can read
  - `push_tokens`: Users manage own tokens only
  - `notification_log`: Users see own notifications
  - `data_requests`: Users see own requests
  - `audit_log`: Admin/super-admin only
  - `consent_records`: Users see own; append-only (no updates/deletes)
- [ ] Implement credential number encryption at application level:
  - GMC/NMC numbers encrypted before storage (AES-256-GCM)
  - Hash stored separately for lookup (`credential_number_hash`)
  - Decryption only in Edge Functions (never on client)
- [ ] Green Badge QR security:
  - 60-second rotation with cryptographic nonce
  - Signed with server-side secret (HMAC-SHA256)
  - Online verification required (QR contains encrypted reference, not raw data)
  - Cannot be screenshot-reused (timestamp + nonce validation)
- [ ] Add rate limiting to critical endpoints (via Supabase Edge Functions + Upstash Redis):
  - Auth: 5 login attempts per 15 minutes per IP
  - Credential verification: 5 attempts per hour per user
  - Emergency report: 3 reports per 5 minutes per user (prevent spam)
  - SMS sending: 10 per hour per user
- [ ] Implement certificate pinning for production builds (prevent MITM on medical data)
- [ ] Add `expo-local-authentication` for biometric unlock on:
  - App re-entry after background
  - Viewing Green Badge credentials
  - Accessing response history (contains medical intervention data)
- [ ] Ensure NO PII in application logs (already enforced — audit all `console.log` statements)
- [ ] Sanitize all database-sourced text before rendering (XSS prevention in emergency descriptions)
- [ ] GDPR data export implementation:
  - In-app "Download My Data" button → generates JSON + PDF
  - Contents: profile, credentials (hashed), responses, location history (last 24h), consent records, notifications (90 days)
  - Delivery within 30 days (target: 7 days automated)
- [ ] GDPR account deletion implementation:
  - 30-day grace period (cancellable)
  - Hard delete: profile, credentials, locations, push tokens
  - Anonymise (retain): response records (clinical governance), audit logs
  - Confirmation email sent

### 4. Offline Capability & Real-time Coordination
**Goal**: App must function in low-connectivity areas where emergencies commonly occur (rural roads, underground stations, tunnels).

- [ ] Implement React Query persistence with `@tanstack/query-async-storage-persister`:
  - Persist: user profile, credentials, nearby equipment locations, emergency protocols
  - Do NOT persist: active emergency details (must be real-time), other responders' data
- [ ] Create offline mutation queue (`src/lib/offline-queue.ts`):
  - Queue: location updates, status changes, emergency reports, handover data
  - Persist queue to AsyncStorage (survives app restart)
  - Auto-sync on network restore with conflict resolution (server wins for status, client wins for notes)
  - Visual indicator: "3 updates pending sync"
- [ ] Implement optimistic updates for:
  - Emergency accept/decline (update store immediately, sync to server)
  - Status changes (en_route, on_scene, completing)
  - Handover completion
- [ ] Supabase Realtime subscriptions with automatic reconnection:
  - Emergency updates: `emergency:{emergencyId}` channel
  - Response coordination: `response:{responseId}` channel
  - Presence tracking: `responders:online` for dispatch
  - Graceful degradation: poll every 30s if WebSocket fails
- [ ] SMS fallback implementation (Twilio):
  - Push notification fails → send SMS with emergency details + short URL
  - SMS commands: YES/Y (accept), NO/N (decline), STATUS, ARRIVED
  - Webhook handler for incoming SMS responses
- [ ] Location tracking with battery optimisation:
  - Available: 30-second intervals (GPS balanced)
  - Responding: 5-second intervals (GPS high accuracy)
  - Off-duty: No tracking (zero battery impact)
  - Foreground service for Android background tracking
- [ ] Cache emergency protocols and first aid guides locally (always available offline)
- [ ] Show stale data age: "Last updated 2 minutes ago" with visual warning after 5 minutes

### 5. Performance
**Goal**: Emergency alerts must render within 500ms. Navigation transitions under 300ms. Battery-conscious location tracking.

- [ ] Replace `FlatList` with `@shopify/flash-list` for all list screens:
  - Alerts list (potentially 20+ items)
  - Response history (unbounded)
  - Equipment locations
  - Credential verification list
- [ ] Audit and memoize expensive renders:
  - `React.memo` on all list item components (EmergencyAlertCard, response cards)
  - `useMemo` for computed values (distance calculations, time formatting)
  - `useCallback` for all event handlers passed as props
- [ ] Image optimisation:
  - Replace `Image` with `expo-image` (caching, blurhash placeholders, progressive loading)
  - Profile photos: thumbnail (100px) + full size variants
  - Compress all app assets (icons, splash)
- [ ] Lazy load heavy screens:
  - Map screen (react-native-maps is heavy)
  - Witness Mode camera screen (expo-camera)
  - QR code generation (react-native-qrcode-svg)
- [ ] Reduce bundle size:
  - Tree-shake lucide-react-native (import individual icons, not barrel)
  - Audit unused dependencies (`depcheck`)
  - Enable Hermes engine optimisations
- [ ] Optimise Supabase queries:
  - Add `.select()` with only needed columns (never `SELECT *` in production)
  - Cursor-based pagination for response history
  - Use RPC functions for geospatial queries (already done for `find_nearby_responders`)
- [ ] Profile with Hermes + Flipper:
  - App cold start target: < 2 seconds
  - Screen transition target: < 300ms
  - Emergency alert render target: < 500ms
  - Location update processing: < 100ms

### 6. Testing
**Goal**: 80%+ coverage on business logic (algorithms, services), 60%+ on components. Critical emergency flow must have E2E coverage.

- [ ] Set up Jest + React Native Testing Library:
  - Configure `jest-expo` preset
  - Add `@testing-library/react-native`
  - Mock Supabase, AsyncStorage, expo-* modules
- [ ] Unit tests — Core algorithms (CRITICAL):
  - `corridor-algorithm.ts`: predictTrajectory, findTrajectoryIntersection, findCorridorResponders
  - `transport-classifier.ts`: classifyTransportMode (all 7 modes), edge cases
  - `distance.ts`: estimateTravelTime, isWithinRadius, sortByDistance
  - `utils.ts`: haversineDistance, calculateBearing, formatDistance, formatDuration
- [ ] Unit tests — Zustand stores:
  - Auth store: setUser, logout, updateUser, persistence
  - Emergency store: addPendingAlert, removePendingAlert, setActiveEmergency, clearActiveResponse
  - Location store: setLocation, setTracking, clearLocation
  - Settings store: all setters, persistence across restarts
- [ ] Unit tests — Services:
  - Auth service: signUp, signIn, signOut, getProfile, transformResponder
  - Emergency service: reportEmergency, acceptEmergency, declineEmergency, transformEmergency
- [ ] Unit tests — Zod schemas:
  - Login schema: valid/invalid emails, password requirements
  - Register schema: name validation, UK phone format, password match
  - GMC schema: 7-digit validation
  - NMC schema: PIN format (12A3456B)
  - Emergency report schema: all emergency types, casualty count bounds
- [ ] Component tests:
  - Button: all 6 variants, loading state, disabled state, icon rendering
  - Input: label, error display, password toggle, keyboard types
  - EmergencyAlertCard: countdown timer, accept/decline callbacks, haptic trigger
  - StatusStepper: all 5 step states, active highlighting
  - GreenBadgeDisplay: QR rendering, countdown, expiry
- [ ] Integration tests — Critical flows:
  - Auth flow: Login → Dashboard redirect, Register → Profile creation
  - Emergency accept flow: Alert → Accept → En Route → On Scene → Handover → Complete
  - Emergency decline flow: Alert → Decline → Reason → Return to dashboard
  - Report emergency flow: Type selection → Details → Submit → Confirmation
- [ ] E2E tests (Maestro recommended for React Native):
  - Full emergency response cycle
  - Registration + credential verification
  - Green Badge display and refresh
  - Settings toggle persistence

### 7. UX Polish & Emergency-Grade Interface
**Goal**: Every interaction must be optimised for high-stress emergency situations. No ambiguity, no delays, impossible to miss critical information.

- [ ] Skeleton loading states on ALL data-driven screens:
  - Dashboard stats, alerts list, response history, map markers, profile data
  - Use `react-native-skeleton-placeholder` or custom Animated shimmers
- [ ] Pull-to-refresh on all list screens (alerts, history, equipment)
- [ ] Haptic feedback (`expo-haptics`) on:
  - Emergency alert received (heavy impact — `NotificationFeedbackType.Warning`)
  - Emergency accepted (success — `NotificationFeedbackType.Success`)
  - Status change buttons (light — `ImpactFeedbackStyle.Light`)
  - Availability toggle (medium — `ImpactFeedbackStyle.Medium`)
  - Error states (error — `NotificationFeedbackType.Error`)
- [ ] Animated transitions:
  - Tab switches: cross-fade (150ms)
  - Emergency alert: slide up from bottom with spring animation
  - Status stepper: animated progress between steps
  - Availability toggle: colour morph animation
  - Green Badge QR: fade rotation on refresh
- [ ] Bottom sheet modals (`@gorhom/bottom-sheet`):
  - Emergency type selector (Report Emergency flow)
  - Decline reason picker
  - Equipment request form
  - Filter options on Alerts screen
- [ ] Emergency alert — high-visibility design:
  - Full-screen overlay with pulsing red border
  - Countdown timer with animated progress bar
  - Vibration pattern: 500ms on, 200ms off, 500ms on, 200ms off, 500ms on
  - Audio alert (custom emergency sound file)
  - Override Do Not Disturb on Android (notification channel priority MAX)
- [ ] Search with debounced input for:
  - Equipment locations (by type, by distance)
  - Response history (by date, by emergency type)
- [ ] Push notification deep links:
  - Emergency alert → Emergency detail screen
  - Status update → Active response screen
  - Credential expiry → Credentials page

### 8. Accessibility (NHS WCAG 2.1 AA Compliance)
**Goal**: WCAG 2.1 AA minimum. All emergency-critical information must be accessible. NHS Digital accessibility guidelines compliance.

- [ ] Add `accessibilityLabel` to ALL interactive elements:
  - Buttons: "Accept emergency", "Decline emergency", "Go available"
  - Navigation: "Home tab", "Alerts tab, 2 new alerts"
  - Cards: "Cardiac arrest at Victoria Station, 3 minutes away"
  - Toggle switches: "Location tracking, currently on"
- [ ] Add `accessibilityRole` to all components:
  - Buttons → `button`, Links → `link`, Inputs → `text`
  - Cards → `summary`, Switches → `switch`, Badges → `text`
  - Headers → `header`, Tab items → `tab`
- [ ] Add `accessibilityHint` for non-obvious actions:
  - Accept button: "Double tap to accept this emergency and begin navigation"
  - Green Badge: "Double tap to display your verified credentials QR code"
  - Availability toggle: "Double tap to change your duty status"
- [ ] Colour contrast audit (minimum 4.5:1 for text, 3:1 for UI):
  - Primary blue (#005EB8) on white: 7.2:1 ✓
  - Emergency red (#DA291C) on white: 5.3:1 ✓
  - Success green (#009639) on white: 4.6:1 ✓
  - Warning yellow (#F59E0B) on white: 2.1:1 ✗ → Darken to #D97706 (3.4:1) or use on dark bg
  - Verify ALL text/background combinations
- [ ] Support dynamic font scaling:
  - `allowFontScaling={true}` on all Text components
  - Test at 200% font size — layouts must not break
  - Emergency alerts must remain readable at max scale
- [ ] Keyboard navigation:
  - All forms navigable with Tab/Enter
  - Focus management on modal open/close
  - Return key submits forms where appropriate
- [ ] Screen reader testing:
  - Android TalkBack: full navigation test of emergency flow
  - iOS VoiceOver: full navigation test of emergency flow
  - Announce: loading states, error states, countdown timer changes
- [ ] Reduced motion support:
  - Respect `AccessibilityInfo.isReduceMotionEnabled()`
  - Replace animations with instant transitions when enabled
  - Emergency pulse animation: replace with static high-contrast border

### 9. Analytics, Monitoring & Clinical Governance
**Goal**: Track every metric needed for NHS clinical governance reporting, response time analysis, and system health.

- [ ] Sentry — Full production configuration:
  - `@sentry/react-native` with Expo plugin
  - Source maps uploaded on every EAS build
  - Performance monitoring: app start, screen loads, API latency
  - Custom breadcrumbs: emergency flow steps (alert→accept→enroute→scene→handover)
  - User context: responder ID + tier (no PII)
  - Release health tracking: crash-free sessions, adoption rate
  - Alert rules: crash spike > 5% → PagerDuty/Slack
- [ ] Analytics service (`src/services/analytics.ts`):
  - 33 predefined events (all from NOTIFICATIONS_AND_ANALYTICS spec)
  - Provider-agnostic: support Mixpanel, Amplitude, or PostHog
  - Disabled in development (console.log fallback)
  - Respect analytics consent toggle
- [ ] Clinical governance metrics (dashboardable):
  - Response time: alert_received → accepted (target: < 30 seconds)
  - Arrival time: accepted → on_scene (target: < 10 minutes)
  - Time on scene: on_scene → handover (variable, tracked)
  - Total incident time: reported → resolved
  - Responder tier distribution per emergency type
  - Corridor Algorithm hit rate: % of alerts from trajectory prediction vs radius
  - Credential verification success/failure rates
  - Equipment request → delivery time
- [ ] System health metrics:
  - Push notification delivery rate (sent vs received)
  - SMS fallback trigger rate (should be < 5%)
  - API error rate by endpoint
  - Supabase Realtime connection uptime
  - Location tracking accuracy distribution
  - App crash rate by screen/flow
- [ ] Audit trail completeness:
  - Every emergency response action logged with timestamp + user_id
  - Credential access logged (who viewed, when, why)
  - Location data access logged (dispatch viewing responder positions)
  - Data export/deletion requests logged
  - All admin actions logged with before/after state

### 10. CI/CD, DevOps & Release Management
**Goal**: Automated, reproducible builds. Every commit tested. Production releases auditable.

- [ ] GitHub Actions workflow (`.github/workflows/ci.yml`):
  - On PR: lint → typecheck → unit tests → build check
  - On merge to main: full test suite → EAS build (preview) → deploy to staging
  - On release tag: EAS build (production) → submit to stores
- [ ] EAS Build profiles (already configured in `eas.json`):
  - `development`: APK for local testing, dev client enabled
  - `preview`: APK for internal distribution (install directly on phones — the feature you requested)
  - `production`: AAB for Google Play Store submission
- [ ] EAS Update (OTA updates):
  - Configure `expo-updates` for over-the-air JS bundle updates
  - Update channels: development, staging, production
  - Critical bug fixes deployed without store review (JS-only changes)
  - Native changes require full EAS build
- [ ] Automated Supabase migration deployment:
  - Store migrations in `supabase/migrations/`
  - CI step: `supabase db push` on merge to main
  - Schema diff review in PR comments
- [ ] Environment management:
  - `.env.development`, `.env.staging`, `.env.production`
  - Different Supabase projects per environment
  - Sentry DSN per environment
  - Feature flags per environment (witness mode, SMS fallback)
- [ ] Release checklist (automated where possible):
  - [ ] All tests pass
  - [ ] TypeScript compiles with zero errors
  - [ ] Bundle size delta check (alert if > 10% increase)
  - [ ] Sentry release created with source maps
  - [ ] Changelog generated from commit messages
  - [ ] Version bumped (semver)
  - [ ] Privacy policy version checked (if data handling changed)

### 11. NHS-Specific Integration Hardening
**Goal**: Prepare for NHS Ambulance Trust pilot. Meet all integration requirements for CAD systems, TfL, and credential APIs.

- [ ] GMC API integration hardening:
  - Retry logic with circuit breaker (if API down, cache last-known status)
  - Fuzzy name matching (handle variations: "Dr Sarah Johnson" vs "JOHNSON, Sarah")
  - Annual re-verification scheduler (alert 30 days before expiry)
  - Store verification timestamp + API response hash (audit trail)
- [ ] NMC API integration hardening:
  - PIN format validation (12A3456B pattern)
  - Expiry date tracking with renewal alerts
  - Same retry/circuit-breaker pattern as GMC
- [ ] NHS DSPT evidence portfolio:
  - Standard 1.1: Document DPO appointment + board sponsor
  - Standard 2.1: Generate role-based access report from RLS policies
  - Standard 3.1: Training completion tracking (future)
  - Standard 4.1: Access management report from audit_log
  - Standard 5.1: Quarterly security review template
  - Standard 6.1: Incident response runbook (breach procedure documented)
  - Standard 7.1: Backup verification report (Supabase automated)
  - Standard 8.1: Dependency vulnerability scanning (npm audit in CI)
  - Standard 9.1: Encryption verification report
  - Standard 10.1: Sub-processor DPA inventory
- [ ] Data breach response implementation:
  - Automated detection: Sentry alerts for unusual patterns
  - Containment: API kill switch via feature flags
  - Assessment: severity classification (high/medium/low)
  - Notification: ICO template (within 72 hours), user email template
  - Documentation: incident log with full timeline
- [ ] Prepare CAD system webhook receiver (future NHS Ambulance Trust integration):
  - Webhook signature verification
  - Emergency type mapping (CAD codes → ProtaRes types)
  - Priority mapping (C1/C2/C3/C4 → critical/serious/moderate/minor)
  - Ambulance ETA relay

---

## Execution Approach

For each domain:
1. **Audit**: Read existing code, identify gaps against the checklist above
2. **Plan**: Propose specific changes with file paths, rationale, and NHS/GDPR justification
3. **Implement**: Make changes incrementally, one concern at a time
4. **Verify**: Run tests + type-check + Metro bundle after each change
5. **Commit**: Clean atomic commits with descriptive messages referencing the domain

## Priority Order (ProtaRes-Specific)

| Priority | Domain | Justification |
|----------|--------|---------------|
| 1 | Architecture & Code Quality | Foundation for all other upgrades |
| 2 | Error Handling & Resilience | App crash during emergency = potential loss of life |
| 3 | Security & NHS Data Protection | DSPT compliance required for NHS pilot |
| 4 | Offline & Real-time | Emergencies occur in poor-connectivity areas |
| 5 | Performance | Every second of delay = worse patient outcomes |
| 6 | Testing | Prevent regressions in critical emergency flows |
| 7 | UX Polish | High-stress UI must be unambiguous and instant |
| 8 | Accessibility | NHS WCAG 2.1 AA compliance + legal obligation |
| 9 | Analytics & Monitoring | Clinical governance reporting + system health |
| 10 | CI/CD & DevOps | Sustainable development + auditable releases |
| 11 | NHS Integration Hardening | Prepare for ambulance trust pilot deployment |

## Metrics & Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| App crash rate | < 0.1% of sessions | Sentry crash-free rate |
| Emergency alert render time | < 500ms | Sentry performance trace |
| Cold start time | < 2 seconds | Hermes profiling |
| API call success rate | > 99.5% | Sentry/analytics |
| Test coverage (business logic) | > 80% | Jest coverage report |
| Test coverage (components) | > 60% | Jest coverage report |
| Accessibility score | WCAG 2.1 AA | Manual audit + automated tools |
| Location tracking battery impact | < 5% per hour (responding) | Device profiling |
| Push notification delivery | > 98% | Expo push receipt tracking |
| GDPR data export response time | < 7 days | Automated pipeline |

---

*This document is the single source of truth for ProtaRes production readiness. Review quarterly or after significant architectural changes.*
*Aligned with: NHS DSPT v5, UK GDPR, WCAG 2.1 AA, ISO 27001 principles*
*Last updated: April 2026*
