# EMERGENCY PROTOCOLS - ProtaRes

## Emergency Handling Logic and Algorithms

---

## 1. CORRIDOR ALGORITHM

### 1.1 Overview

The Corridor Algorithm predicts where responders will be, not just where they are now. This enables alerting responders who are travelling toward an emergency but haven't arrived yet.

### 1.2 Algorithm Flow

```
Emergency Reported
        │
        ▼
┌───────────────────────────────────────┐
│ 1. GET ALL AVAILABLE RESPONDERS       │
│    - Status = 'available'             │
│    - Location consent = true          │
│    - Location updated < 5 min ago     │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 2. FOR EACH RESPONDER:                │
│    - Classify transport mode          │
│    - Get movement vector              │
│    - Match to known routes            │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 3. PREDICT TRAJECTORY                 │
│    - Calculate future positions       │
│    - Check if path intersects         │
│      emergency radius                 │
│    - Calculate ETA if intersects      │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 4. FILTER & RANK                      │
│    - ETA < 10 minutes                 │
│    - Tier matches emergency type      │
│    - Sort by: ETA, Tier, History      │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 5. ALERT TOP RESPONDERS               │
│    - Send to top 5-10 candidates      │
│    - First to accept wins             │
└───────────────────────────────────────┘
```

### 1.3 Implementation

```typescript
// src/lib/corridor-algorithm.ts

import { Coordinates, TransportMode, Responder, Emergency } from '@/types';

interface TrajectoryPoint {
  location: Coordinates;
  timestamp: number; // seconds from now
  confidence: number; // 0-1
}

interface ResponderCandidate {
  responder: Responder;
  etaSeconds: number;
  distanceMeters: number;
  trajectoryMatch: 'direct' | 'corridor' | 'stationary';
  confidence: number;
}

export function findCorridorResponders(
  emergency: Emergency,
  responders: Responder[],
  maxEtaMinutes: number = 10
): ResponderCandidate[] {
  const candidates: ResponderCandidate[] = [];
  const maxEtaSeconds = maxEtaMinutes * 60;
  
  for (const responder of responders) {
    if (!responder.currentLocation) continue;
    
    const trajectory = predictTrajectory(
      responder.currentLocation,
      responder.currentTransportMode,
      responder.locationHistory // Last 5 positions
    );
    
    const intersection = findTrajectoryIntersection(
      trajectory,
      emergency.location,
      getAlertRadius(emergency)
    );
    
    if (intersection && intersection.etaSeconds <= maxEtaSeconds) {
      candidates.push({
        responder,
        etaSeconds: intersection.etaSeconds,
        distanceMeters: intersection.distanceMeters,
        trajectoryMatch: intersection.matchType,
        confidence: intersection.confidence,
      });
    }
  }
  
  // Sort by ETA, then by tier (lower tier number = higher qualification)
  return candidates.sort((a, b) => {
    // Prioritize higher confidence matches
    if (Math.abs(a.confidence - b.confidence) > 0.3) {
      return b.confidence - a.confidence;
    }
    // Then by tier (tier1 > tier2 > tier3 > tier4)
    const tierOrder = { 
      tier1_active_healthcare: 1, 
      tier2_retired_healthcare: 2,
      tier3_first_aid: 3,
      tier4_witness: 4 
    };
    if (tierOrder[a.responder.tier] !== tierOrder[b.responder.tier]) {
      return tierOrder[a.responder.tier] - tierOrder[b.responder.tier];
    }
    // Then by ETA
    return a.etaSeconds - b.etaSeconds;
  });
}

function predictTrajectory(
  currentLocation: Coordinates,
  transportMode: TransportMode,
  locationHistory: Array<{ location: Coordinates; timestamp: Date }>
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];
  
  // Current position with full confidence
  trajectory.push({
    location: currentLocation,
    timestamp: 0,
    confidence: 1.0,
  });
  
  if (transportMode === 'stationary' || locationHistory.length < 2) {
    // No movement prediction for stationary responders
    return trajectory;
  }
  
  // Calculate velocity vector from recent history
  const velocity = calculateVelocity(locationHistory);
  
  if (transportMode === 'bus' || transportMode === 'train') {
    // Match to known public transport routes
    const route = matchToPublicTransportRoute(currentLocation, velocity);
    if (route) {
      // Predict positions along the route
      return predictAlongRoute(currentLocation, route, velocity.speed);
    }
  }
  
  // Linear prediction for walking, driving, cycling
  const predictions = [30, 60, 120, 180, 300, 600]; // seconds
  
  for (const seconds of predictions) {
    const predicted = extrapolatePosition(currentLocation, velocity, seconds);
    trajectory.push({
      location: predicted,
      timestamp: seconds,
      confidence: Math.max(0.3, 1 - (seconds / 600) * 0.7), // Confidence decreases over time
    });
  }
  
  return trajectory;
}

function calculateVelocity(history: Array<{ location: Coordinates; timestamp: Date }>) {
  if (history.length < 2) {
    return { speed: 0, heading: 0 };
  }
  
  const recent = history.slice(-2);
  const timeDelta = (recent[1].timestamp.getTime() - recent[0].timestamp.getTime()) / 1000;
  const distance = haversineDistance(recent[0].location, recent[1].location);
  const speed = distance / timeDelta; // meters per second
  const heading = calculateBearing(recent[0].location, recent[1].location);
  
  return { speed, heading };
}

function findTrajectoryIntersection(
  trajectory: TrajectoryPoint[],
  emergencyLocation: Coordinates,
  radiusMeters: number
): { etaSeconds: number; distanceMeters: number; matchType: string; confidence: number } | null {
  
  for (const point of trajectory) {
    const distance = haversineDistance(point.location, emergencyLocation);
    
    if (distance <= radiusMeters) {
      return {
        etaSeconds: point.timestamp,
        distanceMeters: distance,
        matchType: point.timestamp === 0 ? 'stationary' : 'corridor',
        confidence: point.confidence,
      };
    }
  }
  
  // Check if closest approach is within acceptable range
  const closestApproach = findClosestApproach(trajectory, emergencyLocation);
  if (closestApproach.distance <= radiusMeters * 1.5) {
    // Responder will pass nearby - could divert
    return {
      etaSeconds: closestApproach.timestamp + estimateDiversionTime(closestApproach.distance),
      distanceMeters: closestApproach.distance,
      matchType: 'corridor',
      confidence: closestApproach.confidence * 0.8, // Lower confidence for diversions
    };
  }
  
  return null;
}

// Helper functions
function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = a.latitude * Math.PI / 180;
  const φ2 = b.latitude * Math.PI / 180;
  const Δφ = (b.latitude - a.latitude) * Math.PI / 180;
  const Δλ = (b.longitude - a.longitude) * Math.PI / 180;

  const x = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));

  return R * c;
}

function getAlertRadius(emergency: Emergency): number {
  // Base radius varies by emergency type
  const baseRadius: Record<string, number> = {
    cardiac_arrest: 500,      // Time-critical - tight radius
    road_accident: 800,       // Moderate radius
    stroke: 600,              // Time-critical
    default: 1000,            // Default radius
  };
  
  return baseRadius[emergency.emergencyType] || baseRadius.default;
}
```

---

## 2. TRANSPORT MODE CLASSIFIER

### 2.1 Classification Logic

```typescript
// src/lib/transport-classifier.ts

import { Coordinates, TransportMode } from '@/types';

interface LocationSample {
  coords: Coordinates;
  timestamp: number;
}

interface MovementProfile {
  averageSpeed: number;      // m/s
  speedVariance: number;     // consistency
  accelerationPattern: number[];
  isOnKnownRoute: boolean;
  routeType?: 'bus' | 'train' | 'road';
}

export function classifyTransportMode(
  samples: LocationSample[]
): TransportMode {
  if (samples.length < 2) return 'unknown';
  
  const profile = analyzeMovement(samples);
  
  // Stationary: Very low speed
  if (profile.averageSpeed < 0.5) { // < 0.5 m/s = ~1.8 km/h
    return 'stationary';
  }
  
  // Walking: 1-2 m/s (3.6-7.2 km/h), high variance
  if (profile.averageSpeed < 2 && profile.speedVariance > 0.3) {
    return 'walking';
  }
  
  // Cycling: 3-8 m/s (10-30 km/h), moderate variance
  if (profile.averageSpeed >= 3 && profile.averageSpeed <= 8) {
    if (!profile.isOnKnownRoute || profile.routeType === 'road') {
      return 'cycling';
    }
  }
  
  // Bus: 5-15 m/s with frequent stops, on bus route
  if (profile.isOnKnownRoute && profile.routeType === 'bus') {
    if (hasStopStartPattern(profile.accelerationPattern)) {
      return 'bus';
    }
  }
  
  // Train: 10-40 m/s, on rail route, smooth acceleration
  if (profile.isOnKnownRoute && profile.routeType === 'train') {
    return 'train';
  }
  
  // Driving: 5-30 m/s on road, variable speed
  if (profile.averageSpeed >= 5 && profile.averageSpeed <= 30) {
    if (profile.isOnKnownRoute && profile.routeType === 'road') {
      return 'driving';
    }
  }
  
  // High speed driving (motorway)
  if (profile.averageSpeed > 20) {
    return 'driving';
  }
  
  return 'unknown';
}

function analyzeMovement(samples: LocationSample[]): MovementProfile {
  const speeds: number[] = [];
  const accelerations: number[] = [];
  
  for (let i = 1; i < samples.length; i++) {
    const distance = haversineDistance(samples[i-1].coords, samples[i].coords);
    const timeDelta = (samples[i].timestamp - samples[i-1].timestamp) / 1000;
    const speed = distance / timeDelta;
    speeds.push(speed);
    
    if (i > 1) {
      const acceleration = (speed - speeds[i-2]) / timeDelta;
      accelerations.push(acceleration);
    }
  }
  
  const averageSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const speedVariance = calculateVariance(speeds);
  
  // Check if on known public transport route
  const lastLocation = samples[samples.length - 1].coords;
  const routeMatch = matchToKnownRoute(lastLocation, calculateBearing(
    samples[samples.length - 2].coords,
    lastLocation
  ));
  
  return {
    averageSpeed,
    speedVariance,
    accelerationPattern: accelerations,
    isOnKnownRoute: routeMatch !== null,
    routeType: routeMatch?.type,
  };
}

function hasStopStartPattern(accelerations: number[]): boolean {
  // Bus pattern: frequent rapid deceleration followed by acceleration
  let stopCount = 0;
  
  for (let i = 1; i < accelerations.length; i++) {
    // Detect stop: negative acceleration followed by positive
    if (accelerations[i-1] < -1 && accelerations[i] > 0.5) {
      stopCount++;
    }
  }
  
  // If multiple stops in short period, likely a bus
  return stopCount >= 2;
}
```

---

## 3. RESPONDER TIER MATCHING

### 3.1 Emergency Type to Tier Mapping

```typescript
// src/lib/tier-matching.ts

import { EmergencyType, ResponderTier } from '@/types';

interface TierRequirement {
  minimumTier: ResponderTier;
  preferredTiers: ResponderTier[];
  interventionsRequired: string[];
}

const EMERGENCY_TIER_REQUIREMENTS: Record<EmergencyType, TierRequirement> = {
  // Cardiac - all tiers can help (CPR is universal)
  cardiac_arrest: {
    minimumTier: 'tier4_witness',
    preferredTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid'],
    interventionsRequired: ['cpr', 'aed'],
  },
  
  // Road accidents - need trauma skills
  road_accident: {
    minimumTier: 'tier3_first_aid',
    preferredTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare'],
    interventionsRequired: ['bleeding_control', 'spinal_care', 'airway'],
  },
  
  // Medical emergencies - healthcare preferred
  stroke: {
    minimumTier: 'tier3_first_aid',
    preferredTiers: ['tier1_active_healthcare'],
    interventionsRequired: ['recognition', 'positioning', 'monitoring'],
  },
  
  diabetic_emergency: {
    minimumTier: 'tier3_first_aid',
    preferredTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare'],
    interventionsRequired: ['recognition', 'glucose_management'],
  },
  
  anaphylaxis: {
    minimumTier: 'tier2_retired_healthcare',
    preferredTiers: ['tier1_active_healthcare'],
    interventionsRequired: ['adrenaline_administration', 'airway'],
  },
  
  // Trauma - need bleeding control
  stabbing: {
    minimumTier: 'tier3_first_aid',
    preferredTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare'],
    interventionsRequired: ['bleeding_control', 'wound_packing'],
  },
  
  // Default for other types
  other_medical: {
    minimumTier: 'tier4_witness',
    preferredTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid'],
    interventionsRequired: ['scene_assessment', 'call_guidance'],
  },
};

export function canResponderHandle(
  responderTier: ResponderTier,
  emergencyType: EmergencyType
): boolean {
  const requirement = EMERGENCY_TIER_REQUIREMENTS[emergencyType] 
    || EMERGENCY_TIER_REQUIREMENTS.other_medical;
  
  const tierRank: Record<ResponderTier, number> = {
    tier1_active_healthcare: 1,
    tier2_retired_healthcare: 2,
    tier3_first_aid: 3,
    tier4_witness: 4,
  };
  
  return tierRank[responderTier] <= tierRank[requirement.minimumTier];
}

export function getPreferredTiers(emergencyType: EmergencyType): ResponderTier[] {
  const requirement = EMERGENCY_TIER_REQUIREMENTS[emergencyType] 
    || EMERGENCY_TIER_REQUIREMENTS.other_medical;
  return requirement.preferredTiers;
}
```

---

## 4. ALERT ESCALATION

### 4.1 Escalation Timeline

```
T+0:00   Emergency reported
         │
         ├─► Alert top 5 responders (Tier 1-3 within 5 min ETA)
         │
T+1:00   No acceptance?
         │
         ├─► Alert next 5 responders (expand radius to 8 min)
         │
T+2:00   No acceptance?
         │
         ├─► Alert Tier 4 witnesses for video support
         ├─► Expand to 10 min ETA radius
         │
T+3:00   No acceptance?
         │
         ├─► Send SMS to all eligible responders
         │
T+5:00   No acceptance?
         │
         ├─► Log as "no community response"
         └─► Continue with emergency services only
```

### 4.2 Implementation

```typescript
// src/lib/alert-escalation.ts

interface EscalationLevel {
  delaySeconds: number;
  maxEtaMinutes: number;
  includeTiers: ResponderTier[];
  alertCount: number;
  useSms: boolean;
  expandRadius: boolean;
}

const ESCALATION_LEVELS: EscalationLevel[] = [
  {
    delaySeconds: 0,
    maxEtaMinutes: 5,
    includeTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid'],
    alertCount: 5,
    useSms: false,
    expandRadius: false,
  },
  {
    delaySeconds: 60,
    maxEtaMinutes: 8,
    includeTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid'],
    alertCount: 5,
    useSms: false,
    expandRadius: true,
  },
  {
    delaySeconds: 120,
    maxEtaMinutes: 10,
    includeTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid', 'tier4_witness'],
    alertCount: 10,
    useSms: false,
    expandRadius: true,
  },
  {
    delaySeconds: 180,
    maxEtaMinutes: 10,
    includeTiers: ['tier1_active_healthcare', 'tier2_retired_healthcare', 'tier3_first_aid'],
    alertCount: -1, // All
    useSms: true,
    expandRadius: true,
  },
];

export async function escalateAlerts(
  emergency: Emergency,
  currentLevel: number
): Promise<void> {
  const level = ESCALATION_LEVELS[currentLevel];
  if (!level) {
    // No more escalation levels - log and exit
    await logNoResponse(emergency.id);
    return;
  }
  
  const candidates = await findCorridorResponders(emergency, {
    maxEtaMinutes: level.maxEtaMinutes,
    tiers: level.includeTiers,
  });
  
  // Filter out already-alerted responders
  const newCandidates = candidates.filter(
    c => !emergency.alertedResponderIds.includes(c.responder.id)
  );
  
  // Take top N or all
  const toAlert = level.alertCount === -1 
    ? newCandidates 
    : newCandidates.slice(0, level.alertCount);
  
  // Send alerts
  for (const candidate of toAlert) {
    await sendAlert(emergency, candidate.responder, {
      useSms: level.useSms,
      etaSeconds: candidate.etaSeconds,
    });
  }
  
  // Schedule next escalation
  if (currentLevel < ESCALATION_LEVELS.length - 1) {
    const nextLevel = ESCALATION_LEVELS[currentLevel + 1];
    const delay = nextLevel.delaySeconds - level.delaySeconds;
    
    setTimeout(() => {
      // Check if still needs escalation
      if (!emergency.hasAcceptedResponder) {
        escalateAlerts(emergency, currentLevel + 1);
      }
    }, delay * 1000);
  }
}
```

---

## 5. ALERT MESSAGE TEMPLATES

### 5.1 Push Notification

```typescript
const alertTemplates = {
  cardiac_arrest: {
    title: '🔴 CARDIAC ARREST',
    body: 'Person collapsed {distance} away. CPR needed.',
    priority: 'critical',
    sound: 'emergency_alert.wav',
  },
  
  road_accident: {
    title: '🚗 ROAD ACCIDENT',
    body: '{casualties} casualties at {location}. {eta} away.',
    priority: 'high',
    sound: 'emergency_alert.wav',
  },
  
  corridor_match: {
    title: '🚨 EMERGENCY AHEAD',
    body: '{type} {stops} stops ahead on your route. ETA {eta}.',
    priority: 'critical',
    sound: 'emergency_alert.wav',
  },
};
```

### 5.2 SMS Fallback

```
PROTARES ALERT
{TYPE} at {LOCATION}
{DISTANCE} away, ETA {ETA}
Reply YES to accept
Or open app: protares.com/e/{ID}
```

---

## 6. HANDOVER PROTOCOL

### 6.1 Information to Transfer

When ambulance arrives, responder provides:

```typescript
interface HandoverData {
  // Timeline
  responderArrivedAt: Date;
  timeOnScene: number; // minutes
  
  // Patient state on arrival
  initialAssessment: {
    conscious: boolean;
    breathing: boolean;
    pulse: boolean;
    majorBleeding: boolean;
  };
  
  // Interventions
  interventions: string[];
  // e.g., ['CPR started at 14:32', 'AED applied - 2 shocks', 'Bleeding controlled with tourniquet']
  
  // Current state
  currentAssessment: {
    conscious: boolean;
    breathing: boolean;
    pulse: boolean;
    estimatedBloodLoss?: string;
  };
  
  // Medications given
  medications: Array<{
    name: string;
    dose: string;
    time: Date;
    route: string;
  }>;
  
  // Additional notes
  notes: string;
  
  // Responder details
  responder: {
    name: string;
    tier: ResponderTier;
    credentialType: string;
  };
}
```

### 6.2 Handover Screen UI

```
┌─────────────────────────────────────────┐
│         HANDOVER TO AMBULANCE           │
├─────────────────────────────────────────┤
│                                         │
│  TIME ON SCENE: 8 minutes               │
│                                         │
│  PATIENT ARRIVED:                       │
│  ☑ Unconscious  ☑ Not breathing         │
│                                         │
│  INTERVENTIONS:                         │
│  • CPR started immediately              │
│  • AED applied - 2 shocks delivered     │
│  • ROSC achieved at 14:38               │
│                                         │
│  PATIENT NOW:                           │
│  ☑ Conscious  ☑ Breathing               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Additional notes (optional)     │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   COMPLETE HANDOVER             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  EMS will receive this summary          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. WITNESS MODE PROTOCOL

### 7.1 Video Quality Management

```typescript
const videoQualitySettings = {
  excellent: { // > 10 Mbps
    resolution: '1080p',
    bitrate: 2500,
    framerate: 30,
  },
  good: { // 5-10 Mbps
    resolution: '720p',
    bitrate: 1500,
    framerate: 30,
  },
  moderate: { // 2-5 Mbps
    resolution: '480p',
    bitrate: 800,
    framerate: 24,
  },
  poor: { // < 2 Mbps
    resolution: '360p',
    bitrate: 400,
    framerate: 15,
  },
  veryPoor: { // < 500 Kbps
    resolution: '240p',
    bitrate: 200,
    framerate: 10,
  },
};

// Automatically adjust based on network conditions
function selectVideoQuality(networkSpeed: number): VideoQuality {
  if (networkSpeed > 10000) return videoQualitySettings.excellent;
  if (networkSpeed > 5000) return videoQualitySettings.good;
  if (networkSpeed > 2000) return videoQualitySettings.moderate;
  if (networkSpeed > 500) return videoQualitySettings.poor;
  return videoQualitySettings.veryPoor;
}
```

### 7.2 Dispatcher Guidance Commands

```typescript
const dispatcherCommands = [
  { id: 'show_patient', text: 'Show me the patient' },
  { id: 'show_breathing', text: 'Can you show if they\'re breathing?' },
  { id: 'show_injuries', text: 'Show me any visible injuries' },
  { id: 'show_surroundings', text: 'Pan around to show surroundings' },
  { id: 'count_casualties', text: 'How many people are hurt?' },
  { id: 'show_scene_safety', text: 'Is the scene safe? Show any hazards' },
  { id: 'start_cpr', text: 'Start CPR - I\'ll guide you' },
  { id: 'stop_bleeding', text: 'Apply pressure to stop bleeding' },
];
```

---

## 8. LOW NETWORK PROTOCOL

### 8.1 Fallback Chain

```
1. Push Notification (primary)
   │
   └─► Failed? Try SMS
       │
       └─► SMS sent with short URL
           │
           └─► User can respond via SMS
               or open URL when connected
```

### 8.2 SMS Commands

```
Incoming SMS to ProtaRes:
- "YES" or "Y" - Accept current alert
- "NO" or "N" - Decline current alert
- "STATUS" - Get current emergency status
- "ARRIVED" - Mark as arrived on scene
- "HELP" - Get command list
```

### 8.3 Offline Mode

```typescript
// Cache critical data for offline access
const offlineCache = {
  // Always cache
  userProfile: true,
  credentials: true,
  nearbyAEDs: true,
  emergencyProtocols: true,
  
  // Cache when responding
  activeEmergency: true,
  navigationRoute: true,
  emergencyContacts: true,
};

// Queue actions when offline
const offlineQueue = [
  { action: 'updateLocation', data: {...}, timestamp: Date },
  { action: 'updateStatus', data: {...}, timestamp: Date },
];

// Sync when back online
async function syncOfflineActions() {
  for (const item of offlineQueue) {
    try {
      await executeAction(item);
      removeFromQueue(item);
    } catch (error) {
      // Keep in queue for retry
      console.error('Sync failed:', error);
    }
  }
}
```

---

*This document defines the core emergency handling algorithms and protocols for ProtaRes.*
