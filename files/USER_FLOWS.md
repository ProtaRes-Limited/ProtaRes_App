# USER FLOWS - ProtaRes

## User Journeys and Screen Sequences

---

## 1. ONBOARDING & REGISTRATION

### 1.1 New User Registration

```
┌─────────────────┐
│   App Launch    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     First time user
│   Onboarding    │◄────────────────────
│  (3-4 slides)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Account │
│  - Email        │
│  - Password     │
│  - Name         │
│  - Phone        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Phone    │
│ (SMS code)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Role     │
│ - Healthcare    │───► Credential Verification Flow
│ - First Aid     │───► Certificate Upload Flow
│ - Witness       │───► Direct to Home
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Location        │
│ Permission      │
│ Request         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notification    │
│ Permission      │
│ Request         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Home        │
│   Dashboard     │
└─────────────────┘
```

### 1.2 Credential Verification (Healthcare)

```
┌─────────────────┐
│ Select Tier     │
│ □ Doctor (GMC)  │
│ □ Nurse (NMC)   │
│ □ Paramedic     │
│ □ Retired       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Details   │
│ - GMC/NMC Number│
│ - Full Name     │
│ (as registered) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Verifying...  │
│ [Spinner]       │
│ Checking with   │
│ GMC/NMC API     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│Success│ │ Failed │
│  ✓    │ │   ✗    │
└───┬───┘ └────┬───┘
    │          │
    ▼          ▼
┌───────┐ ┌────────┐
│Tier 1 │ │Retry or│
│Granted│ │Contact │
│       │ │Support │
└───────┘ └────────┘
```

---

## 2. GOING ON DUTY

### 2.1 Availability Toggle

```
┌─────────────────────────────────────────┐
│            HOME SCREEN                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     STATUS: UNAVAILABLE         │   │
│  │                                 │   │
│  │    [ GO AVAILABLE ]             │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
                    │
                    │ Tap "Go Available"
                    ▼
┌─────────────────────────────────────────┐
│         CONSENT CONFIRMATION            │
├─────────────────────────────────────────┤
│                                         │
│  "Going on duty?"                       │
│                                         │
│  When you're Available, we'll:          │
│  • Track your location                  │
│  • Send you emergency alerts            │
│  • Share your ETA with dispatchers      │
│                                         │
│  Your location is deleted after 24hrs   │
│                                         │
│  [ Cancel ]     [ I'm Ready ]           │
│                                         │
└─────────────────────────────────────────┘
                    │
                    │ Confirm
                    ▼
┌─────────────────────────────────────────┐
│            HOME SCREEN                   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     STATUS: AVAILABLE ●         │   │
│  │     Location: Tracking          │   │
│  │                                 │   │
│  │    [ GO UNAVAILABLE ]           │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  You'll receive alerts for nearby       │
│  emergencies                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. EMERGENCY ALERT & RESPONSE

### 3.1 Receiving an Alert

```
User is going about their day...
         │
         │ Emergency within range
         ▼
┌─────────────────────────────────────────┐
│     !!!  CRITICAL ALERT  !!!            │
│     [Phone vibrates, plays alert]       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔴 ROAD ACCIDENT               │   │
│  │                                 │   │
│  │  📍 A38, near Exeter Services   │   │
│  │  🚌 3 stops ahead on your route │   │
│  │  ⏱️  ETA: 4 minutes              │   │
│  │                                 │   │
│  │  2 casualties reported          │   │
│  │  Ambulance ETA: 18 mins         │   │
│  │                                 │   │
│  │  ┌───────────┬───────────┐     │   │
│  │  │  DECLINE  │  ACCEPT   │     │   │
│  │  └───────────┴───────────┘     │   │
│  │                                 │   │
│  │       ⏳ 58 seconds to respond   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 Complete Response Flow

```
┌─────────────┐
│ Alert       │
│ Received    │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
┌─────┐  ┌─────────┐
│DECLINE│  │ ACCEPT  │
└──┬──┘  └────┬────┘
   │          │
   ▼          ▼
┌──────┐  ┌─────────────────┐
│Reason│  │ EN ROUTE        │
│Modal │  │ - Navigation    │
│      │  │ - Live updates  │
└──────┘  │ - Status btn    │
          └────────┬────────┘
                   │
                   ▼ Arrived
          ┌─────────────────┐
          │ ON SCENE        │
          │ - Situation     │
          │ - Actions       │
          │ - Equipment     │
          └────────┬────────┘
                   │
                   ▼ Ambulance arrives
          ┌─────────────────┐
          │ HANDOVER        │
          │ - Summary       │
          │ - Patient info  │
          │ - Sign off      │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ COMPLETE        │
          │ - Feedback      │
          │ - Notes         │
          │ - Wellbeing     │
          └─────────────────┘
```

### 3.3 En Route Screen

```
┌─────────────────────────────────────────┐
│  ← Back                    STATUS ▼     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         [MAP VIEW]              │   │
│  │                                 │   │
│  │     🔵 You ───────► 🔴 Scene    │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ETA: 3 minutes                         │
│  Distance: 0.8 km                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🚨 ROAD ACCIDENT                │   │
│  │ A38 near Exeter Services        │   │
│  │                                 │   │
│  │ Casualties: 2                   │   │
│  │ Ambulance ETA: 15 mins          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [ I'VE ARRIVED ON SCENE ]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Call 999 │  │ Witness Video    │   │
│  └──────────┘  └──────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 3.4 On Scene Screen

```
┌─────────────────────────────────────────┐
│  ON SCENE                   ⏱️ 00:04:32  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ SITUATION ASSESSMENT            │   │
│  ├─────────────────────────────────┤   │
│  │ Conscious?    [ Yes ] [ No ]    │   │
│  │ Breathing?    [ Yes ] [ No ]    │   │
│  │ Major bleeding? [Yes] [ No ]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ACTIONS TAKEN                   │   │
│  ├─────────────────────────────────┤   │
│  │ □ CPR started                   │   │
│  │ □ AED applied                   │   │
│  │ □ Bleeding controlled           │   │
│  │ □ Recovery position             │   │
│  │ □ Airway cleared                │   │
│  │ □ Spinal immobilisation         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ REQUEST EQUIPMENT               │   │
│  │ [ AED ] [ Trauma Kit ] [ Other ]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    [ AMBULANCE HAS ARRIVED ]    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 4. WITNESS MODE

### 4.1 Reporting an Emergency (Witness)

```
┌─────────────────┐
│ Home Screen     │
│                 │
│ [ REPORT        │
│   EMERGENCY ]   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         WHAT'S HAPPENING?               │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │ 🚗        │  │ ❤️        │          │
│  │ Road      │  │ Cardiac   │          │
│  │ Accident  │  │ Emergency │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │ 🏥        │  │ 🩸        │          │
│  │ Medical   │  │ Serious   │          │
│  │ Emergency │  │ Injury    │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  ┌───────────────────────────┐         │
│  │ ❓ Other / Unsure         │         │
│  └───────────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
         │
         │ Select "Road Accident"
         ▼
┌─────────────────────────────────────────┐
│         CONFIRM LOCATION                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         [MAP VIEW]              │   │
│  │                                 │   │
│  │            📍                   │   │
│  │     [Draggable pin]             │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📍 A38 Northbound, near junction 31   │
│                                         │
│  [ CONFIRM LOCATION ]                   │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         QUICK DETAILS                   │
├─────────────────────────────────────────┤
│                                         │
│  How many people are hurt?              │
│  [ 1 ] [ 2 ] [ 3+ ] [ Unknown ]         │
│                                         │
│  Are they conscious?                    │
│  [ Yes ] [ No ] [ Some/Unknown ]        │
│                                         │
│  Are they breathing?                    │
│  [ Yes ] [ No ] [ Unknown ]             │
│                                         │
│  Any additional details? (optional)     │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ SUBMIT REPORT ]                      │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       REPORT SUBMITTED ✓                │
├─────────────────────────────────────────┤
│                                         │
│  Emergency services have been notified  │
│                                         │
│  Trained responders are being alerted   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎥 START WITNESS VIDEO         │   │
│  │                                 │   │
│  │  Help responders see the scene  │   │
│  │  before they arrive             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Skip - Stay on call with 999 ]       │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 Witness Video Stream

```
┌─────────────────────────────────────────┐
│  🔴 STREAMING TO DISPATCH               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  │      [CAMERA VIEWFINDER]        │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 💬 "Show me the casualties"     │   │
│  │    - Dispatcher                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🎤 Your microphone is ON               │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ 🔇 Mute  │  │ 🛑 End Stream    │   │
│  └──────────┘  └──────────────────┘   │
│                                         │
│  ───────────────────────────────────── │
│  Responder arriving in 2 minutes       │
│  Dr. Sarah J. ●                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. GREEN BADGE VERIFICATION

### 5.1 Displaying Badge

```
Profile > Green Badge
         │
         ▼
┌─────────────────────────────────────────┐
│         YOUR GREEN BADGE                │
├─────────────────────────────────────────┤
│                                         │
│           ┌───────────┐                │
│           │  ✓        │                │
│           │ VERIFIED  │                │
│           └───────────┘                │
│                                         │
│        Dr. Sarah Johnson               │
│        ────────────────                │
│        Tier 1: Active Healthcare       │
│        GMC Verified                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │   │
│  │       ▓▓ QR CODE  ▓▓▓          │   │
│  │       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Valid for: 0:58                       │
│  [████████████░░░░]                    │
│                                         │
│  "Show this to emergency services"     │
│                                         │
│  [ REGENERATE ] [ WHAT'S THIS? ]       │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Scanning Badge (EMS)

```
┌─────────────────────────────────────────┐
│         VERIFY RESPONDER                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [CAMERA VIEWFINDER]        │   │
│  │                                 │   │
│  │         ┌─────────┐             │   │
│  │         │  Scan   │             │   │
│  │         │   QR    │             │   │
│  │         └─────────┘             │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Point camera at Green Badge QR code   │
│                                         │
└─────────────────────────────────────────┘
         │
         │ Scan successful
         ▼
┌─────────────────────────────────────────┐
│         ✓ VERIFIED                      │
├─────────────────────────────────────────┤
│                                         │
│           ┌───────────┐                │
│           │    ✓      │                │
│           │ VERIFIED  │                │
│           └───────────┘                │
│                                         │
│        Dr. Sarah Johnson               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Tier:      Active Healthcare   │   │
│  │ GMC:       Verified ✓          │   │
│  │ Registered: General Practice   │   │
│  │ Valid:     Current             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Verification time: 14:32:15           │
│  Verified by: LAS Dispatcher #42       │
│                                         │
│  [ DONE ]                              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 6. SETTINGS & PRIVACY

### 6.1 Privacy Settings

```
Settings > Privacy
         │
         ▼
┌─────────────────────────────────────────┐
│  ← Settings        PRIVACY              │
├─────────────────────────────────────────┤
│                                         │
│  LOCATION                               │
│  ─────────────────────────────────────  │
│  Location Tracking              [ON]    │
│  Only when "Available"                  │
│                                         │
│  View Location History ›                │
│  (Last 24 hours only)                   │
│                                         │
│  DATA & PRIVACY                         │
│  ─────────────────────────────────────  │
│  Download My Data ›                     │
│  Get a copy of all your data            │
│                                         │
│  Delete My Account ›                    │
│  Permanently remove all data            │
│                                         │
│  CONSENT PREFERENCES                    │
│  ─────────────────────────────────────  │
│  Emergency Alerts          [ON] 🔒     │
│  Required for service                   │
│                                         │
│  Analytics                    [ON]      │
│  Help improve ProtaRes                  │
│                                         │
│  Marketing                   [OFF]      │
│  Occasional updates                     │
│                                         │
│  Research Participation      [OFF]      │
│  Anonymised data for studies            │
│                                         │
└─────────────────────────────────────────┘
```

### 6.2 Delete Account Flow

```
Delete My Account
         │
         ▼
┌─────────────────────────────────────────┐
│        ⚠️ DELETE ACCOUNT?               │
├─────────────────────────────────────────┤
│                                         │
│  This will permanently delete:          │
│                                         │
│  • Your profile and settings            │
│  • Your credentials                     │
│  • Your location history                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  The following will be anonymised       │
│  (required for clinical governance):    │
│                                         │
│  • Your response history                │
│  • Audit logs                           │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  You have 30 days to change your mind   │
│                                         │
│  Type "DELETE" to confirm:              │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ CANCEL ]  [ DELETE MY ACCOUNT ]      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. RESPONSE HISTORY

```
┌─────────────────────────────────────────┐
│  ← Profile       RESPONSE HISTORY       │
├─────────────────────────────────────────┤
│                                         │
│  YOUR STATISTICS                        │
│  ┌─────────────────────────────────┐   │
│  │ 47          12         4:32     │   │
│  │ Total       Accepted   Avg Time │   │
│  │ Alerts      Responses  (mins)   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  RECENT RESPONSES                       │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🚗 Road Accident                │   │
│  │ Today, 14:32                    │   │
│  │ A38 near Exeter                 │   │
│  │ Status: Completed ✓             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ❤️ Cardiac Arrest               │   │
│  │ Yesterday, 09:15                │   │
│  │ Victoria Station                │   │
│  │ Status: Completed ✓             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏥 Medical Emergency            │   │
│  │ Feb 15, 16:45                   │   │
│  │ Oxford Street                   │   │
│  │ Status: Declined                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Load More ]                         │
│                                         │
└─────────────────────────────────────────┘
```

---

*This document outlines all major user journeys in ProtaRes.*
