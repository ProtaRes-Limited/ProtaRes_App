# PRIVACY AND COMPLIANCE - ProtaRes

## GDPR, Data Protection, and NHS Compliance

---

## 1. OVERVIEW

ProtaRes handles sensitive data including:
- Personal identifiable information (PII)
- Location data (highly sensitive under GDPR)
- Health-related professional credentials
- Emergency incident data
- Video/audio from emergency scenes

This document outlines compliance requirements and implementation guidelines.

---

## 2. REGULATORY FRAMEWORK

### 2.1 UK GDPR
The UK General Data Protection Regulation applies as ProtaRes processes personal data of UK residents.

**Key Principles:**
1. Lawfulness, fairness, transparency
2. Purpose limitation
3. Data minimisation
4. Accuracy
5. Storage limitation
6. Integrity and confidentiality
7. Accountability

### 2.2 Data Protection Act 2018
UK implementation of GDPR with specific provisions for:
- Law enforcement processing
- Intelligence services
- Health and social care

### 2.3 NHS Data Security and Protection Toolkit (DSPT)
Required for any system handling NHS data or integrating with NHS systems.

**10 Data Security Standards:**
1. Personal confidential data
2. Staff responsibilities
3. Training
4. Managing data access
5. Process reviews
6. Responding to incidents
7. Continuity planning
8. Unsupported systems
9. IT protection
10. Accountable suppliers

### 2.4 Medical Device Regulations
**ProtaRes is NOT a medical device** because:
- It does not provide clinical advice
- It does not diagnose conditions
- It is a coordination/communication platform
- Responders act as Good Samaritans, not as agents of the platform

This classification must be maintained to avoid MDR requirements.

---

## 3. LAWFUL BASIS FOR PROCESSING

### 3.1 Responder Data

| Data Category | Lawful Basis | Justification |
|---------------|--------------|---------------|
| Account data (name, email, phone) | Contract | Necessary to provide the service |
| Credentials (GMC/NMC numbers) | Consent + Legitimate Interest | Verify qualifications for safety |
| Location (when on duty) | Consent | Explicit opt-in required |
| Response history | Legitimate Interest | Service improvement, quality assurance |
| Push tokens | Contract | Necessary for emergency alerts |

### 3.2 Witness/Reporter Data

| Data Category | Lawful Basis | Justification |
|---------------|--------------|---------------|
| Phone number | Legitimate Interest | Emergency contact, follow-up |
| Location | Vital Interests | Life-saving emergency response |
| Video/audio stream | Vital Interests | Scene assessment for responder safety |

### 3.3 Emergency Data

| Data Category | Lawful Basis | Justification |
|---------------|--------------|---------------|
| Incident details | Vital Interests | Coordinate emergency response |
| Casualty information | Vital Interests | Appropriate medical response |
| Outcome data | Legitimate Interest | Service improvement, research |

---

## 4. DATA MINIMISATION

### 4.1 What We Collect

**Necessary Data (Collected):**
- Name (for identification)
- Phone (for SMS fallback, verification)
- Email (for account, notifications)
- Credential numbers (for verification only)
- Location (when on duty, with consent)
- Response actions (for clinical governance)

**Not Collected:**
- Full date of birth (only age verification if needed)
- Home address (not required)
- Payment details (free service for responders)
- Biometric data
- Racial/ethnic origin
- Political opinions
- Religious beliefs

### 4.2 Location Data Specifics

```
Location Tracking Rules:
├── Only tracked when:
│   ├── User is logged in
│   ├── User has set status to "Available"
│   ├── User has granted location consent
│   └── User has enabled location permissions
├── Tracking frequency:
│   ├── Available: Every 30 seconds
│   ├── Responding: Every 5 seconds
│   └── Unavailable: Not tracked
├── Retention:
│   ├── Live location: Overwritten with each update
│   ├── Location history: 24 hours rolling
│   └── Response locations: 7 years (clinical governance)
└── Deletion:
    ├── Automatic: 24-hour rolling cleanup
    └── On request: Immediate (except legal holds)
```

---

## 5. DATA RETENTION

### 5.1 Retention Schedule

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Account data | Until account deletion + 30 days | Service provision |
| Location history | 24 hours rolling | Minimisation |
| Response records | 7 years | Clinical governance, legal |
| Credentials | Until expiry + 1 year | Audit trail |
| Witness video | Per trust policy (typically 7 years) | Evidence, governance |
| Audit logs | 7 years | Compliance, legal |
| Analytics (anonymised) | Indefinite | Service improvement |
| Marketing consent records | 7 years | Proof of consent |

### 5.2 Implementation

```typescript
// Automated retention enforcement
const retentionPolicies = {
  location_history: {
    retention: '24 hours',
    action: 'delete',
    schedule: 'hourly',
  },
  inactive_accounts: {
    retention: '2 years',
    action: 'anonymise',
    schedule: 'monthly',
  },
  response_records: {
    retention: '7 years',
    action: 'archive',
    schedule: 'annually',
  },
};
```

---

## 6. DATA SUBJECT RIGHTS

### 6.1 Right to Access (Article 15)

**Implementation:**
- In-app "Download My Data" feature
- Generates comprehensive data export
- Delivered within 30 days (target: 7 days)
- Format: JSON and human-readable PDF

**Export Contents:**
```json
{
  "profile": { /* name, email, phone, tier */ },
  "credentials": [ /* credential history */ ],
  "responses": [ /* all emergency responses */ ],
  "location_history": [ /* last 24 hours only */ ],
  "consent_records": [ /* all consent changes */ ],
  "notifications": [ /* last 90 days */ ],
  "generated_at": "2026-02-18T12:00:00Z"
}
```

### 6.2 Right to Rectification (Article 16)

**Implementation:**
- In-app profile editing
- Support contact for credential corrections
- Audit trail of all changes

### 6.3 Right to Erasure (Article 17)

**Implementation:**
- In-app "Delete My Account" feature
- 30-day grace period (cancelable)
- Permanent deletion after grace period

**Exceptions (data retained):**
- Response records (clinical governance - anonymised)
- Audit logs (legal requirement - anonymised)
- Aggregated analytics (no PII)

**Deletion Process:**
```
User Request → 30-day cooling off → Hard Delete
                    ↓
              Can cancel via support
                    ↓
              After 30 days:
              ├── Delete: profile, credentials, locations
              ├── Anonymise: responses, audit logs
              └── Notify: user via email
```

### 6.4 Right to Data Portability (Article 20)

**Implementation:**
- Export in machine-readable format (JSON)
- Standard schema for interoperability
- Includes all user-provided data

### 6.5 Right to Object (Article 21)

**Implementation:**
- Granular consent controls
- Can object to: marketing, analytics, location tracking
- Cannot object to: essential processing for service

### 6.6 Right to Restrict Processing (Article 18)

**Implementation:**
- Account suspension option
- Data retained but not processed
- Can be reactivated

---

## 7. CONSENT MANAGEMENT

### 7.1 Consent Types

| Consent | Required | Default | Withdrawable |
|---------|----------|---------|--------------|
| Terms of Service | Yes | N/A | Account deletion |
| Privacy Policy | Yes | N/A | Account deletion |
| Location Tracking | Yes (for responders) | Off | Yes |
| Push Notifications | No | On | Yes |
| SMS Fallback | No | On | Yes |
| Marketing Communications | No | Off | Yes |
| Analytics | No | On | Yes |
| Research Participation | No | Off | Yes |

### 7.2 Consent Collection

**At Registration:**
```typescript
const registrationConsents = [
  {
    type: 'terms_of_service',
    required: true,
    text: 'I agree to the Terms of Service',
    link: '/legal/terms',
  },
  {
    type: 'privacy_policy',
    required: true,
    text: 'I agree to the Privacy Policy',
    link: '/legal/privacy',
  },
  {
    type: 'location_tracking',
    required: false, // Required later to go "on duty"
    text: 'I consent to location tracking when I am on duty',
    explanation: 'We only track your location when you set your status to Available...',
  },
];
```

**Consent Records:**
```sql
-- Every consent change is recorded
INSERT INTO consent_records (
  responder_id,
  consent_type,
  granted,
  consent_version,
  ip_address,
  user_agent,
  created_at
) VALUES (...);
```

### 7.3 Consent Withdrawal

- Available in Settings > Privacy
- Immediate effect
- Clear explanation of consequences
- Easy to reverse (re-consent)

---

## 8. SECURITY MEASURES

### 8.1 Data Encryption

| Data State | Encryption | Standard |
|------------|------------|----------|
| At rest (database) | Yes | AES-256 |
| In transit | Yes | TLS 1.3 |
| Backups | Yes | AES-256 |
| Credential numbers | Yes | Application-level encryption |
| Location data | Yes | Database + TLS |

### 8.2 Access Controls

```
Access Levels:
├── User (Responder)
│   ├── Own profile: Read/Write
│   ├── Own credentials: Read/Write
│   ├── Own responses: Read
│   ├── Active emergencies: Read (limited)
│   └── Other users: No access
├── Dispatcher
│   ├── Active emergencies: Read/Write
│   ├── Responder locations: Read (active only)
│   ├── Verify credentials: Read
│   └── Personal data: No access
├── Admin
│   ├── All data: Read
│   ├── User management: Write
│   ├── System config: Write
│   └── Audit logs: Read
└── Super Admin
    ├── Everything Admin has
    ├── Data deletion: Execute
    └── Security settings: Write
```

### 8.3 Authentication

- Email/phone verification required
- Strong password requirements
- Session management (auto-logout after inactivity)
- Device management (revoke sessions)
- Optional: Biometric for quick unlock

### 8.4 Audit Logging

**All Sensitive Actions Logged:**
- Login/logout
- Profile changes
- Credential access
- Location access
- Emergency response actions
- Data exports
- Data deletions
- Admin actions

**Log Format:**
```json
{
  "timestamp": "2026-02-18T12:00:00Z",
  "user_id": "uuid",
  "action": "view_emergency",
  "resource_type": "emergency",
  "resource_id": "uuid",
  "ip_address": "192.168.1.1",
  "user_agent": "ProtaRes/1.0 iOS",
  "details": {
    "emergency_type": "cardiac_arrest",
    "reason": "responder_alert"
  }
}
```

---

## 9. INCIDENT RESPONSE

### 9.1 Data Breach Procedure

```
Breach Detected
      ↓
Contain (immediately)
      ↓
Assess severity (within 1 hour)
      ↓
├── High: Personal data exposed
│   ├── Notify ICO within 72 hours
│   ├── Notify affected users "without undue delay"
│   └── Document everything
├── Medium: Technical breach, no data exposed
│   ├── Document internally
│   └── Review security measures
└── Low: Failed attempt
    └── Log and monitor
```

### 9.2 Notification Templates

**To ICO:**
```
Subject: Personal Data Breach Notification - ProtaRes

Nature of breach: [description]
Categories of data: [list]
Approximate number of individuals: [number]
Likely consequences: [assessment]
Measures taken: [actions]
Contact: [DPO details]
```

**To Users:**
```
Subject: Important Security Notice from ProtaRes

Dear [Name],

We are writing to inform you of a data security incident...

What happened: [plain language explanation]
What data was involved: [specific to this user]
What we are doing: [remediation steps]
What you can do: [recommended actions]

Contact our Data Protection Officer: dpo@protares.com
```

---

## 10. THIRD-PARTY PROCESSORS

### 10.1 Sub-Processors

| Processor | Purpose | Data Shared | Location | DPA |
|-----------|---------|-------------|----------|-----|
| Supabase | Database, Auth | All app data | EU | Yes |
| Google Cloud | Maps, Geocoding | Location queries | EU | Yes |
| Twilio | SMS | Phone numbers | US (EU data) | Yes |
| Sentry | Error tracking | Error logs (no PII) | EU | Yes |
| Expo | Push notifications | Push tokens | US | Yes |

### 10.2 Data Processing Agreements

All sub-processors must have:
- Signed DPA
- Appropriate safeguards for international transfers
- Security certifications (SOC 2, ISO 27001)
- Breach notification obligations

---

## 11. INTERNATIONAL TRANSFERS

### 11.1 Transfer Mechanisms

For US-based processors:
- Standard Contractual Clauses (SCCs)
- Supplementary measures where required
- Data minimisation before transfer

### 11.2 Data Localisation

**Preference:** Keep data in UK/EU where possible
- Primary database: EU (Supabase EU region)
- Backups: EU
- Analytics: EU or anonymised before transfer

---

## 12. PRIVACY BY DESIGN

### 12.1 Principles Applied

1. **Proactive not reactive** - Privacy built in from design phase
2. **Privacy as default** - Location tracking off by default
3. **Privacy embedded** - Not an add-on
4. **Full functionality** - Privacy doesn't reduce features
5. **End-to-end security** - Encryption throughout
6. **Visibility and transparency** - Clear privacy notices
7. **Respect for user privacy** - User-centric design

### 12.2 Technical Implementation

```typescript
// Example: Privacy-respecting location update
async function updateLocation(location: Location) {
  // Check consent before processing
  if (!user.hasConsent('location_tracking')) {
    throw new ConsentRequiredError('Location tracking consent required');
  }
  
  // Check availability status
  if (user.availability !== 'available') {
    return; // Don't track when off duty
  }
  
  // Minimise data
  const minimalLocation = {
    lat: roundToDecimalPlaces(location.lat, 5), // ~1m precision
    lng: roundToDecimalPlaces(location.lng, 5),
    timestamp: new Date(),
    // Don't store: altitude, speed, heading (unless responding)
  };
  
  // Store with automatic expiry
  await storeLocation(minimalLocation, { expiresIn: '24h' });
  
  // Audit log (without exact location)
  await auditLog('location_update', { region: getRegion(location) });
}
```

---

## 13. USER-FACING PRIVACY FEATURES

### 13.1 Privacy Dashboard

```
Settings > Privacy
├── Location Tracking
│   ├── Status: [On/Off]
│   ├── "We only track when you're Available"
│   └── [View location history] (last 24h)
├── Data & Privacy
│   ├── [Download my data]
│   ├── [Delete my account]
│   └── [Consent preferences]
├── Notifications
│   ├── Emergency alerts: [Always on - required]
│   ├── Marketing: [On/Off]
│   └── Research participation: [On/Off]
└── Connected Services
    ├── [Manage credentials]
    └── [Revoke third-party access]
```

### 13.2 Privacy Notices (In-App)

**Location Permission Request:**
```
ProtaRes needs your location to alert you to nearby emergencies.

• We only track when you're "Available"
• Location history is deleted after 24 hours
• You can turn this off anytime in Settings

[Allow While Using App] [Allow Always] [Don't Allow]
```

**First Time On Duty:**
```
Going on duty?

When you're Available, we'll:
• Track your location to match you with emergencies
• Send you alerts for incidents on your route
• Share your ETA with dispatchers (not other responders)

Your location is never shared with other responders or stored longer than 24 hours.

[I understand, go Available] [Not now]
```

---

## 14. NHS DSPT COMPLIANCE

### 14.1 Evidence Requirements

| Standard | Requirement | ProtaRes Implementation |
|----------|-------------|------------------------|
| 1.1 | Senior ownership | DPO appointed, board-level sponsor |
| 1.2 | Data flow mapping | Documented in this file |
| 2.1 | Staff responsibilities | Role-based access, training |
| 3.1 | Training | Annual security training |
| 4.1 | Access management | RLS, audit logs |
| 5.1 | Process reviews | Quarterly security reviews |
| 6.1 | Incident response | Breach procedure documented |
| 7.1 | Continuity | Backup and recovery tested |
| 8.1 | Unsupported systems | Dependency monitoring |
| 9.1 | IT protection | Encryption, access controls |
| 10.1 | Suppliers | DPAs with all processors |

### 14.2 Annual Assessment

- Complete DSPT self-assessment annually
- Submit by 30 June each year
- Maintain evidence portfolio
- Address any "Standards Not Met"

---

## 15. CONTACT INFORMATION

**Data Protection Officer:**
- Email: dpo@protares.com
- Phone: [TBD]
- Address: [TBD]

**Supervisory Authority:**
- Information Commissioner's Office (ICO)
- Website: ico.org.uk
- Phone: 0303 123 1113

---

*This document is version 1.0. Review annually or after significant changes.*
*Last updated: February 2026*
