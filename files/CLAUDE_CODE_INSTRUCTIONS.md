# CLAUDE CODE INSTRUCTIONS - ProtaRes

## Quick Start for Claude Code in Cursor IDE

---

## READ THIS FIRST

You are building **ProtaRes**, an intelligent emergency response coordination platform. This is a life-saving application - code quality and reliability are critical.

### Document Reading Order

1. **This file** - Setup and approach
2. **APP_BLUEPRINT.md** - Complete feature specification
3. **DESIGN_SYSTEM.md** - UI/UX guidelines
4. **DATABASE_SCHEMA.sql** - Supabase database structure
5. **PRIVACY_AND_COMPLIANCE.md** - GDPR, NHS DSPT requirements
6. **STATE_AND_SERVICES.md** - State management and APIs
7. **COMPONENT_LIBRARY.md** - Reusable components
8. **USER_FLOWS.md** - Screen flows and journeys
9. **FORMS_AND_VALIDATION.md** - Form schemas
10. **CONFIG_AND_SETUP.md** - Environment configuration
11. **NOTIFICATIONS_AND_ANALYTICS.md** - Push notifications, analytics
12. **EMERGENCY_PROTOCOLS.md** - Emergency handling logic
13. **INTEGRATION_SPECS.md** - Third-party integrations

---

## PROJECT SETUP

### 1. Create Expo Project

```bash
npx create-expo-app protares-app --template expo-template-blank-typescript
cd protares-app
```

### 2. Install Core Dependencies

```bash
# Navigation
npx expo install expo-router react-native-screens react-native-safe-area-context

# Styling
npm install nativewind tailwindcss
npx tailwindcss init

# State Management
npm install zustand @tanstack/react-query

# Supabase
npm install @supabase/supabase-js

# Forms
npm install react-hook-form zod @hookform/resolvers

# Maps & Location
npx expo install expo-location react-native-maps

# Notifications
npx expo install expo-notifications expo-device

# Camera & Media (for Witness Mode)
npx expo install expo-camera expo-av expo-media-library

# Secure Storage
npx expo install expo-secure-store

# Other Essentials
npx expo install expo-constants expo-linking expo-status-bar
npm install date-fns lodash
npm install -D @types/lodash
```

### 3. Install UI Libraries

```bash
# Icons
npm install lucide-react-native react-native-svg

# Bottom Sheet
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler

# Animations
npx expo install react-native-reanimated
```

### 4. Project Structure

```
protares-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth screens (login, register)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-credentials.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── alerts.tsx            # Active alerts
│   │   ├── map.tsx               # Map view
│   │   ├── history.tsx           # Response history
│   │   ├── profile.tsx           # Profile & settings
│   │   └── _layout.tsx
│   ├── emergency/                # Emergency response screens
│   │   ├── [id].tsx              # Emergency detail
│   │   ├── respond.tsx           # Accept/respond screen
│   │   ├── navigate.tsx          # Navigation to scene
│   │   ├── witness-mode.tsx      # Live video streaming
│   │   ├── on-scene.tsx          # On-scene actions
│   │   └── handover.tsx          # Handover to EMS
│   ├── witness/                  # Witness mode screens
│   │   ├── report.tsx            # Report emergency
│   │   ├── stream.tsx            # Stream video
│   │   └── equipment-request.tsx # Request equipment
│   ├── credentials/              # Credential management
│   │   ├── index.tsx             # View credentials
│   │   ├── verify.tsx            # Verify via GMC/NMC
│   │   └── green-badge.tsx       # Display Green Badge QR
│   ├── settings/                 # Settings screens
│   │   ├── index.tsx
│   │   ├── availability.tsx      # Set availability
│   │   ├── notifications.tsx     # Notification preferences
│   │   ├── privacy.tsx           # Privacy settings
│   │   └── data-export.tsx       # GDPR data export
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
├── src/
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   ├── emergency/            # Emergency-specific components
│   │   ├── map/                  # Map components
│   │   ├── credentials/          # Credential components
│   │   └── forms/                # Form components
│   ├── hooks/                    # Custom hooks
│   ├── services/                 # API services
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── emergencies.ts
│   │   ├── responders.ts
│   │   ├── credentials.ts
│   │   └── notifications.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.ts
│   │   ├── location.ts
│   │   ├── emergency.ts
│   │   └── settings.ts
│   ├── lib/                      # Utilities
│   │   ├── corridor-algorithm.ts # Trajectory prediction
│   │   ├── transport-classifier.ts
│   │   ├── distance.ts
│   │   ├── encryption.ts
│   │   └── constants.ts
│   ├── types/                    # TypeScript types
│   │   ├── emergency.ts
│   │   ├── responder.ts
│   │   ├── credentials.ts
│   │   └── index.ts
│   └── config/                   # Configuration
│       ├── theme.ts
│       └── env.ts
├── assets/                       # Images, fonts
├── docs/                         # This documentation
├── supabase/                     # Supabase config
│   ├── migrations/
│   └── functions/
├── app.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## CRITICAL RULES

### 1. Emergency-First Design
- Emergency alerts MUST be high-priority and impossible to miss
- Location tracking MUST be accurate and battery-efficient
- App MUST work in low-network conditions (SMS fallback)
- Never block UI during critical emergency flows

### 2. Privacy & Compliance
- All location data encrypted at rest and in transit
- Location tracking ONLY when user consents and is "on duty"
- 24-hour rolling location retention (then deleted)
- Full GDPR compliance: export, delete, consent management
- NHS Data Security and Protection Toolkit (DSPT) compliance

### 3. Credential Verification
- Never store raw credential numbers in plain text
- Verify against GMC/NMC APIs before granting tier status
- Green Badge QR codes must be dynamic (time-limited)
- Regular re-verification (annual for healthcare professionals)

### 4. Real-Time Requirements
- Use Supabase Realtime for emergency updates
- Location updates every 5 seconds when responding
- WebSocket connection for dispatch coordination
- Graceful degradation to polling if WebSocket fails

### 5. Offline Capability
- Cache critical emergency data locally
- Queue actions when offline, sync when connected
- SMS fallback for alerts in poor connectivity areas

### 6. Code Quality
- TypeScript strict mode - no `any` types
- All API calls wrapped in error handling
- Loading and error states for every async operation
- Comprehensive logging for debugging (but no PII in logs)

---

## BUILD PHASES

### Phase 1: Foundation (Week 1)
- [ ] Project setup with all dependencies
- [ ] Supabase project and database schema
- [ ] Authentication flow (email + phone)
- [ ] Basic navigation structure
- [ ] Design system implementation

### Phase 2: Core Responder Features (Week 2)
- [ ] Location tracking service
- [ ] Responder profile and settings
- [ ] Availability toggle (on/off duty)
- [ ] Credential verification flow
- [ ] Green Badge display

### Phase 3: Emergency Response (Week 3)
- [ ] Emergency alert system
- [ ] Corridor Algorithm implementation
- [ ] Accept/decline emergency flow
- [ ] Navigation to scene
- [ ] On-scene status updates

### Phase 4: Witness Mode (Week 4)
- [ ] Emergency reporting for witnesses
- [ ] Live video streaming
- [ ] Equipment request system
- [ ] Guidance relay from dispatch

### Phase 5: Advanced Features (Week 5)
- [ ] Multi-agency coordination
- [ ] Transport mode classification
- [ ] Low-network resilience (SMS)
- [ ] Response history and statistics

### Phase 6: Polish & Compliance (Week 6)
- [ ] GDPR data export/delete
- [ ] Privacy settings
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Error tracking (Sentry)

---

## KEY ALGORITHMS TO IMPLEMENT

### Corridor Algorithm (see lib/corridor-algorithm.ts)
Predicts where responders will be based on:
- Current location
- Velocity and heading
- Known transport routes (bus, train lines)
- Traffic conditions
- Time of day patterns

### Transport Mode Classifier (see lib/transport-classifier.ts)
Determines if responder is:
- Walking (can stop immediately)
- On bus/train (needs to exit at future stop)
- Driving (can divert but needs safe stopping point)
- Stationary (immediately available)

### Alert Prioritization
When emergency reported:
1. Find all responders within 10-minute travel time
2. Apply Corridor Algorithm to predict arrivals
3. Filter by responder tier (match to emergency type)
4. Sort by: ETA, credential level, historical response rate
5. Alert top 5-10 responders simultaneously

---

## TESTING REQUIREMENTS

- Unit tests for Corridor Algorithm
- Unit tests for Transport Mode Classifier
- Integration tests for emergency flow
- E2E tests for critical paths
- Load testing for concurrent emergencies

---

## ENVIRONMENT VARIABLES NEEDED

See `CONFIG_AND_SETUP.md` for full list. Critical ones:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GMC_API_KEY=
NMC_API_KEY=
GOOGLE_MAPS_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENTRY_DSN=
```

---

## WHEN YOU'RE STUCK

1. Check APP_BLUEPRINT.md for feature specifications
2. Check USER_FLOWS.md for screen sequences
3. Check EMERGENCY_PROTOCOLS.md for handling logic
4. Ask me for clarification on any requirement

---

## START BUILDING

Begin with:
1. Create the Expo project
2. Set up the file structure
3. Implement the Supabase schema
4. Build authentication
5. Proceed phase by phase

**Remember: This app saves lives. Quality over speed.**
