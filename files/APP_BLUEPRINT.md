# APP BLUEPRINT - ProtaRes

## Intelligent Emergency Response Coordination Platform

---

## 1. APP OVERVIEW

### What ProtaRes Does
ProtaRes is an emergency response coordination platform that connects trained responders to nearby emergencies using predictive trajectory-based alerting. Unlike traditional radius-based systems that only alert responders who are currently near an emergency, ProtaRes predicts where responders *will be* and alerts them accordingly.

### Core Value Proposition
- **For Responders:** Receive intelligent alerts for emergencies on your route, not just near your current location
- **For Emergency Services:** Mobilise trained community responders to arrive before ambulances
- **For Witnesses:** Get immediate guidance and connect responders to the scene via live video
- **For Society:** Save lives by reducing time-to-first-response from 47+ minutes to under 5 minutes

### Target Users
1. Healthcare professionals (doctors, nurses, paramedics)
2. Retired healthcare workers
3. First aid certified individuals
4. General public (as witnesses)
5. Emergency service dispatchers
6. NHS Ambulance Trusts, Police, Fire Services

### App Name & Branding
- **Name:** ProtaRes (from "Protagonist" + "Response" - anyone can become the protagonist in saving a life)
- **Tagline:** "Every Second Counts. Every Responder Matters."
- **Website:** protares.com

---

## 2. EMERGENCY TYPES COVERED

### 2.1 Road Traffic Accidents (Primary Focus)
- Vehicle collisions
- Pedestrian incidents
- Cyclist injuries
- Motorcycle crashes
- Multi-vehicle incidents

**Key Interventions:** Haemorrhage control, airway management, spinal immobilisation, extrication support

### 2.2 Cardiac Emergencies
- Sudden cardiac arrest
- Heart attacks
- Severe arrhythmias

**Key Interventions:** CPR, defibrillation, aspirin administration

### 2.3 Medical Emergencies
- Stroke
- Diabetic crisis (hypo/hyperglycaemia)
- Severe allergic reactions (anaphylaxis)
- Seizures
- Breathing difficulties

**Key Interventions:** Recognition, positioning, medication administration (where trained)

### 2.4 Trauma Incidents
- Stabbings
- Assaults
- Serious falls
- Industrial accidents

**Key Interventions:** Bleeding control, wound packing, tourniquet application

### 2.5 Home Emergencies
- Choking
- Drowning
- Burns
- Electrocution
- Poisoning/overdose

**Key Interventions:** Appropriate first aid, Naloxone administration (for overdose)

---

## 3. CORE FEATURES

### 3.1 Corridor Algorithm™ (Patent-Pending)
Predicts responder trajectories to alert those heading toward emergencies.

**How it works:**
1. Tracks responder location with consent
2. Identifies transport mode (walking, bus, train, driving)
3. Matches to known transport routes
4. Predicts future positions along route
5. Calculates ETA to emergency scene
6. Alerts responders who will pass near the emergency

**Example:**
A nurse on bus route 73 receives: "Road accident 3 stops ahead on your route. ETA 4 minutes."

### 3.2 Transport Mode Classifier™ (Patent-Pending)
Distinguishes how responders are travelling to provide appropriate alerts.

**Classifications:**
- **Walking:** Can stop immediately, direct to scene
- **Bus/Train:** Alert at appropriate stop, show exit point
- **Driving:** Suggest safe stopping point, navigation to scene
- **Cycling:** Direct route possible, show bike parking
- **Stationary:** Immediately available, show walking route

**Detection Method:**
- Speed analysis
- Movement patterns
- Acceleration signatures
- Route matching to public transport
- User confirmation option

### 3.3 Witness Mode™ (Patent-Pending)
Live video streaming from emergency scene to dispatchers and responders.

**Features:**
- One-tap video streaming to dispatch
- Audio communication with dispatcher
- Scene assessment before responder arrival
- Evidence capture for clinical governance
- Guidance overlay for bystander instructions
- Works on low bandwidth (adaptive quality)

### 3.4 Green Badge™ Verification (Patent-Pending)
Real-time credential verification for emergency services.

**How it works:**
1. Responder registers with professional credentials
2. System verifies against GMC/NMC/HCPC registers
3. Dynamic QR code generated (time-limited, encrypted)
4. Emergency services scan to verify identity and qualifications
5. Shows: Name, photo, credential tier, verification timestamp

**QR Code Security:**
- Regenerates every 60 seconds
- Contains encrypted credential hash
- Requires online verification to validate
- Cannot be screenshot and reused

### 3.5 Equipment Request System (Patent-Pending)
Witnesses and responders can request specific equipment delivery.

**Equipment Types:**
- AED (Automated External Defibrillator)
- Trauma kit (tourniquets, wound packing)
- Burn kit
- Naloxone kit
- Obstetric kit
- Basic medical supplies

**Request Flow:**
1. Witness/responder identifies need
2. Requests via app with location
3. Dispatch coordinates delivery (drone, nearby responder, emergency vehicle)
4. Tracks delivery ETA
5. Confirms receipt

### 3.6 Multi-Agency Coordination (Patent-Pending)
Seamless integration with ambulance, police, and fire services.

**Integration Points:**
- NHS Ambulance Trust CAD systems
- Police dispatch (for road incidents)
- Fire service (for extrication, equipment)
- Transport networks (TfL bus integration)
- Air ambulance landing zone coordination

**Coordination Features:**
- Shared incident view
- Role assignment (who's doing what)
- Resource tracking (who's en route)
- Handover management
- Post-incident reporting

### 3.7 Low-Network Resilience (Patent-Pending)
Works in areas with poor mobile signal.

**Fallback Methods:**
1. SMS alerts when data unavailable
2. Compressed data mode for slow connections
3. Offline caching of critical information
4. Store-and-forward for updates
5. Audio-only mode for very low bandwidth

### 3.8 Four-Tier Responder System
Stratified responder classification based on qualifications.

| Tier | Qualifications | Colour | Permitted Interventions |
|------|----------------|--------|------------------------|
| **Tier 1: Active Healthcare** | Current GMC/NMC/HCPC registration | Green | Full scope per registration, trauma management, medications |
| **Tier 2: Retired Healthcare** | Former registration + refresher course | Purple | CPR, defibrillation, bleeding control, basic medications |
| **Tier 3: First Aid Trained** | Current St John/Red Cross certificate | Yellow | CPR, defibrillation, bleeding control, recovery position |
| **Tier 4: Community Witness** | None required | Blue | Scene safety, video streaming, relay instructions, traffic control |

### 3.9 Dynamic Travel Pass
Free travel for responders during emergencies.

**How it works:**
1. Responder accepts emergency
2. System generates travel pass
3. Shows to bus driver/conductor
4. Valid for journey to emergency and return
5. Settlement with transport providers (TfL, etc.)

---

## 4. USER ROLES & PERMISSIONS

### 4.1 Responder (All Tiers)
**Can:**
- Register and verify credentials
- Set availability (on/off duty)
- Receive and respond to alerts
- Navigate to emergencies
- Update status (en route, on scene, completing)
- View response history
- Access Green Badge
- Request equipment
- Report incidents

**Cannot:**
- Access other responders' personal data
- View emergencies outside their area
- Modify their credential tier

### 4.2 Witness
**Can:**
- Report emergencies
- Stream video via Witness Mode
- Request equipment
- Receive dispatcher guidance
- Track responder arrival

**Cannot:**
- See responder identities until arrival
- Access historical data

### 4.3 Dispatcher (Emergency Services)
**Can:**
- View all active emergencies
- See responder locations and ETAs
- Assign responders to incidents
- Communicate with responders
- Access Witness Mode streams
- Coordinate multi-agency response
- Verify Green Badges
- Close incidents

**Cannot:**
- Access responder personal data beyond operational need
- View off-duty responder locations

### 4.4 Administrator
**Can:**
- Manage responder accounts
- Review and approve credentials
- Configure system settings
- Access analytics and reports
- Handle data subject requests (GDPR)
- Manage integrations

**Cannot:**
- Access location data without audit trail
- Override credential verification

---

## 5. SCREEN INVENTORY

### 5.1 Authentication Screens
| Screen | Description |
|--------|-------------|
| `Splash` | App launch, auto-login check |
| `Onboarding` | 3-4 slides explaining app purpose |
| `Login` | Email/phone + password |
| `Register` | Account creation |
| `VerifyPhone` | SMS code verification |
| `CredentialSelection` | Choose responder tier |
| `CredentialVerification` | Enter GMC/NMC number for verification |
| `ForgotPassword` | Password reset flow |

### 5.2 Main Tab Screens
| Screen | Tab | Description |
|--------|-----|-------------|
| `Home` | Home | Dashboard with status, recent activity, quick actions |
| `Alerts` | Alerts | Active and recent emergency alerts |
| `Map` | Map | Map view of nearby emergencies and responders |
| `History` | History | Past responses, statistics |
| `Profile` | Profile | Profile, settings, credentials |

### 5.3 Emergency Response Screens
| Screen | Description |
|--------|-------------|
| `EmergencyAlert` | Incoming alert with accept/decline (modal) |
| `EmergencyDetail` | Full emergency information |
| `AcceptResponse` | Confirmation and estimated arrival |
| `Navigation` | Turn-by-turn navigation to scene |
| `EnRoute` | Status updates while travelling |
| `OnScene` | Arrived, begin intervention |
| `Intervention` | Log actions taken |
| `Handover` | Transfer care to ambulance |
| `Complete` | End response, optional notes |
| `Feedback` | Post-response feedback |

### 5.4 Witness Mode Screens
| Screen | Description |
|--------|-------------|
| `ReportEmergency` | Report new emergency |
| `EmergencyType` | Select emergency type |
| `LocationConfirm` | Confirm/adjust location |
| `WitnessStream` | Live video to dispatch |
| `GuidanceOverlay` | Instructions from dispatcher |
| `EquipmentRequest` | Request equipment delivery |
| `ResponderArrival` | Responder ETA and info |

### 5.5 Credential Screens
| Screen | Description |
|--------|-------------|
| `Credentials` | View current credentials |
| `VerifyGMC` | GMC verification flow |
| `VerifyNMC` | NMC verification flow |
| `VerifyFirstAid` | Upload first aid certificate |
| `GreenBadge` | Display Green Badge QR |
| `ScanBadge` | Scan another's badge (for EMS) |

### 5.6 Settings Screens
| Screen | Description |
|--------|-------------|
| `Settings` | Main settings menu |
| `Availability` | On/off duty, schedule |
| `Notifications` | Alert preferences |
| `Privacy` | Location, data sharing settings |
| `DataExport` | GDPR data export |
| `DeleteAccount` | Account deletion |
| `About` | App info, legal |
| `Help` | FAQ, support contact |

---

## 6. NAVIGATION STRUCTURE

### Tab Navigator (Main)
```
TabNavigator
├── Home (HomeStack)
│   ├── Dashboard
│   └── QuickActions
├── Alerts (AlertsStack)
│   ├── AlertsList
│   ├── EmergencyDetail
│   └── Respond
├── Map (MapStack)
│   ├── MapView
│   └── EmergencyDetail
├── History (HistoryStack)
│   ├── HistoryList
│   └── ResponseDetail
└── Profile (ProfileStack)
    ├── Profile
    ├── Credentials
    ├── GreenBadge
    └── Settings
```

### Modal Screens (Overlay)
- Emergency Alert (critical, high priority)
- Witness Mode Stream
- Equipment Request
- Green Badge Display

### Auth Stack (Unauthenticated)
```
AuthStack
├── Onboarding
├── Login
├── Register
├── VerifyPhone
└── ForgotPassword
```

---

## 7. API ENDPOINTS (Supabase Edge Functions)

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create account |
| `/auth/login` | POST | Login |
| `/auth/verify-phone` | POST | Verify phone number |
| `/auth/refresh` | POST | Refresh token |

### Responders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/responders/profile` | GET/PUT | Get/update profile |
| `/responders/availability` | PUT | Set availability status |
| `/responders/location` | POST | Update location |
| `/responders/credentials` | GET/POST | Manage credentials |
| `/responders/verify-gmc` | POST | Verify GMC registration |
| `/responders/verify-nmc` | POST | Verify NMC registration |
| `/responders/green-badge` | GET | Generate Green Badge |
| `/responders/history` | GET | Get response history |
| `/responders/statistics` | GET | Get personal stats |

### Emergencies
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/emergencies` | GET | List nearby emergencies |
| `/emergencies/:id` | GET | Get emergency detail |
| `/emergencies/report` | POST | Report new emergency |
| `/emergencies/:id/respond` | POST | Accept emergency |
| `/emergencies/:id/decline` | POST | Decline emergency |
| `/emergencies/:id/status` | PUT | Update response status |
| `/emergencies/:id/complete` | POST | Complete response |
| `/emergencies/:id/handover` | POST | Record handover |

### Witness Mode
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/witness/stream/start` | POST | Start video stream |
| `/witness/stream/stop` | POST | Stop video stream |
| `/witness/equipment-request` | POST | Request equipment |

### Equipment
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/equipment/nearby` | GET | Find nearby equipment |
| `/equipment/request` | POST | Request delivery |
| `/equipment/:id/status` | GET | Delivery status |

### Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notifications/register` | POST | Register push token |
| `/notifications/preferences` | GET/PUT | Notification settings |

### GDPR
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gdpr/export` | POST | Request data export |
| `/gdpr/delete` | POST | Request account deletion |
| `/gdpr/consent` | GET/PUT | Manage consent |

---

## 8. THIRD-PARTY INTEGRATIONS

### Required Integrations
| Service | Purpose | Priority |
|---------|---------|----------|
| **Supabase** | Auth, database, storage, realtime | Critical |
| **Google Maps** | Maps, navigation, geocoding | Critical |
| **Expo Notifications** | Push notifications | Critical |
| **GMC API** | Doctor credential verification | Critical |
| **NMC API** | Nurse credential verification | Critical |
| **Twilio** | SMS fallback, phone verification | High |
| **Sentry** | Error tracking | High |

### Future Integrations
| Service | Purpose | Phase |
|---------|---------|-------|
| **NHS Spine** | Patient data (with governance) | Phase 2 |
| **TfL API** | Bus routes, real-time positions | Phase 2 |
| **What3Words** | Precise location communication | Phase 2 |
| **Drone Providers** | Equipment delivery coordination | Phase 3 |
| **CAD Systems** | Ambulance dispatch integration | Phase 3 |

---

## 9. BUSINESS LOGIC & RULES

### 9.1 Alert Radius & Timing
- Default alert radius: 10-minute travel time (not fixed distance)
- Corridor algorithm extends effective range along transport routes
- Alert timeout: 60 seconds to accept
- If declined by all, expand radius and re-alert

### 9.2 Responder Matching
1. Filter by availability (on duty only)
2. Filter by credential tier (match to emergency type)
3. Calculate ETA using Corridor Algorithm
4. Sort by: ETA (primary), credential level (secondary)
5. Alert top 5-10 responders
6. First to accept gets assigned

### 9.3 Emergency Escalation
- If no response in 2 minutes: Expand radius
- If no response in 5 minutes: Alert Tier 4 (witnesses for video)
- If no response in 10 minutes: Log as "no community response"
- Emergency services always notified in parallel

### 9.4 Credential Expiry
- GMC/NMC: Annual re-verification required
- First Aid certificates: Verify expiry date, alert 30 days before
- Expired credentials: Downgrade to Tier 4 until renewed

### 9.5 Location Privacy
- Location tracked only when "on duty"
- 24-hour rolling retention (then deleted)
- Location never shared with other responders
- Dispatch sees location only for active emergencies

---

## 10. ADMIN FEATURES

### 10.1 Dashboard
- Active emergencies map
- Responder availability overview
- Response time metrics
- System health status

### 10.2 Responder Management
- View/search all responders
- Verify credentials manually
- Suspend/reactivate accounts
- View response history

### 10.3 Emergency Management
- View all emergencies
- Override assignments
- Close/cancel emergencies
- Generate incident reports

### 10.4 Analytics
- Response time trends
- Coverage maps (where responders are)
- Credential distribution
- Acceptance/decline rates

### 10.5 Configuration
- Alert radius settings
- Notification templates
- Integration settings
- Feature flags

### 10.6 Compliance
- Data subject request handling
- Audit log viewer
- Consent management
- Data retention reports

---

## 11. UNIQUE SELLING POINTS

1. **Trajectory Prediction:** Only platform that alerts responders based on where they're going, not just where they are

2. **Multi-Emergency:** Covers road accidents, cardiac, medical, trauma - not just AED/cardiac

3. **Multi-Agency:** Designed for ambulance, police, fire coordination from day one

4. **Credential Verification:** Real-time GMC/NMC verification with dynamic Green Badge

5. **Witness Mode:** Live video from scene enables remote clinical assessment

6. **UK-Focused:** Built for NHS integration, UK regulations, UK transport networks

7. **Privacy-First:** GDPR compliant, minimal data retention, user control

---

## 12. MONETIZATION MODEL

### B2B (Primary)
- NHS Ambulance Trust subscriptions
- Per-incident fees for coordinated responses
- Multi-agency integration licensing

### B2C (Secondary - Future)
- Freemium for responders (free basic, premium analytics)
- Training/certification partnerships

### Pricing (Proposed)
- Pilot phase: Free
- Post-pilot: Per-incident or trust-wide subscription
- Outcome-based pricing option (per life saved/outcome improved)

---

## 13. COMPLIANCE REQUIREMENTS

### GDPR
- Right to access (data export)
- Right to erasure (account deletion)
- Right to portability
- Consent management
- Data minimisation
- Privacy by design

### NHS Data Security
- Data Security and Protection Toolkit (DSPT) compliance
- Clinical governance framework
- Incident reporting
- Audit trails

### Medical Device Regulations
- ProtaRes is a coordination platform, NOT a medical device
- No clinical advice provided by platform
- Responders act as Good Samaritans

See `PRIVACY_AND_COMPLIANCE.md` for full details.

---

## 14. FUTURE ROADMAP

### Phase 2 (6-12 months)
- TfL bus integration (driver alerts)
- Drone equipment delivery coordination
- What3Words integration
- Advanced analytics dashboard

### Phase 3 (12-18 months)
- NHS Spine integration
- CAD system direct integration
- AI-powered demand prediction
- Training/simulation mode

### Phase 4 (18-24 months)
- International expansion (adapt for other countries)
- Wearable device support
- Vehicle integration (connected cars)
- Research partnerships

---

*This document is the single source of truth for ProtaRes features and requirements.*
