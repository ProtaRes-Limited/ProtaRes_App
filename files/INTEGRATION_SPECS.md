# INTEGRATION SPECS - ProtaRes

## Third-Party Service Integrations

---

## 1. GMC (GENERAL MEDICAL COUNCIL) API

### 1.1 Overview

The GMC Register allows verification of UK doctor registrations.

**API Documentation:** https://www.gmc-uk.org/registration-and-licensing/the-medical-register

### 1.2 Verification Flow

```typescript
// supabase/functions/verify-gmc/index.ts

interface GMCVerificationRequest {
  gmcNumber: string;
  fullName: string;
}

interface GMCVerificationResponse {
  verified: boolean;
  registrationStatus: 'registered' | 'suspended' | 'erased' | 'not_found';
  fullName: string;
  registrationType: string;
  specialties: string[];
  conditions: string[];
  lastUpdated: string;
}

export async function verifyGMC(request: GMCVerificationRequest): Promise<GMCVerificationResponse> {
  const response = await fetch(`${GMC_API_URL}/register/check`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GMC_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gmcReferenceNumber: request.gmcNumber,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`GMC API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Verify name matches (fuzzy match to handle variations)
  const nameMatch = fuzzyNameMatch(request.fullName, data.fullName);
  
  return {
    verified: data.registrationStatus === 'registered' && nameMatch,
    registrationStatus: data.registrationStatus,
    fullName: data.fullName,
    registrationType: data.registrationType,
    specialties: data.specialties || [],
    conditions: data.conditions || [],
    lastUpdated: data.lastUpdated,
  };
}

function fuzzyNameMatch(provided: string, registered: string): boolean {
  const normalize = (name: string) => 
    name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .sort()
      .join(' ');
  
  return normalize(provided) === normalize(registered);
}
```

### 1.3 Data Stored

After successful verification:

```typescript
await supabase.from('credentials').insert({
  responder_id: userId,
  credential_type: 'gmc',
  credential_number_hash: hashCredential(gmcNumber), // Never store raw
  verification_status: 'verified',
  verified_at: new Date().toISOString(),
  verified_by: 'api_gmc',
  verification_response: {
    registrationType: response.registrationType,
    specialties: response.specialties,
    // Don't store full response - only what's needed
  },
});

// Update responder tier
await supabase.from('responders').update({
  tier: 'tier1_active_healthcare',
}).eq('id', userId);
```

---

## 2. NMC (NURSING AND MIDWIFERY COUNCIL) API

### 2.1 Overview

The NMC Register verifies UK nurse and midwife registrations.

**API Documentation:** https://www.nmc.org.uk/registration/search-the-register/

### 2.2 Verification Flow

```typescript
// supabase/functions/verify-nmc/index.ts

interface NMCVerificationRequest {
  nmcPin: string; // Format: 12A3456B
  fullName: string;
}

interface NMCVerificationResponse {
  verified: boolean;
  registrationStatus: 'registered' | 'lapsed' | 'removed' | 'not_found';
  fullName: string;
  registrationParts: string[]; // ['Registered Nurse', 'Adult']
  effectiveFrom: string;
  expiryDate: string;
}

export async function verifyNMC(request: NMCVerificationRequest): Promise<NMCVerificationResponse> {
  // Validate PIN format
  const pinRegex = /^[0-9]{2}[A-Z][0-9]{4}[A-Z]$/;
  if (!pinRegex.test(request.nmcPin)) {
    throw new Error('Invalid NMC PIN format');
  }
  
  const response = await fetch(`${NMC_API_URL}/register/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NMC_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pin: request.nmcPin,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`NMC API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  const nameMatch = fuzzyNameMatch(request.fullName, data.fullName);
  const notExpired = new Date(data.expiryDate) > new Date();
  
  return {
    verified: data.registrationStatus === 'registered' && nameMatch && notExpired,
    registrationStatus: data.registrationStatus,
    fullName: data.fullName,
    registrationParts: data.registrationParts,
    effectiveFrom: data.effectiveFrom,
    expiryDate: data.expiryDate,
  };
}
```

---

## 3. GOOGLE MAPS PLATFORM

### 3.1 Services Used

| Service | Purpose | API |
|---------|---------|-----|
| Maps SDK | Display maps in app | react-native-maps |
| Directions API | Navigation routes | REST API |
| Geocoding API | Address ↔ Coordinates | REST API |
| Places API | Location search | REST API |

### 3.2 Maps Integration

```typescript
// src/components/map/EmergencyMap.tsx
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Emergency, Coordinates } from '@/types';

interface EmergencyMapProps {
  emergency: Emergency;
  userLocation: Coordinates;
  route?: Coordinates[];
}

export function EmergencyMap({ emergency, userLocation, route }: EmergencyMapProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: (userLocation.latitude + emergency.location.latitude) / 2,
        longitude: (userLocation.longitude + emergency.location.longitude) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* User marker */}
      <Marker
        coordinate={userLocation}
        title="You"
        pinColor="blue"
      />
      
      {/* Emergency marker */}
      <Marker
        coordinate={emergency.location}
        title="Emergency"
        pinColor="red"
      />
      
      {/* Route line */}
      {route && (
        <Polyline
          coordinates={route}
          strokeColor="#005EB8"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}
```

### 3.3 Directions API

```typescript
// src/services/navigation.ts

interface DirectionsResult {
  route: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
  instructions: string[];
}

export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  mode: 'driving' | 'walking' | 'transit' = 'driving'
): Promise<DirectionsResult> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=${mode}` +
    `&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Directions API error: ${data.status}`);
  }
  
  const route = data.routes[0];
  const leg = route.legs[0];
  
  // Decode polyline to coordinates
  const points = decodePolyline(route.overview_polyline.points);
  
  return {
    route: points,
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
    instructions: leg.steps.map((step: any) => step.html_instructions),
  };
}

function decodePolyline(encoded: string): Coordinates[] {
  const points: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  
  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    
    shift = 0;
    result = 0;
    
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    
    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }
  
  return points;
}
```

---

## 4. SUPABASE REALTIME

### 4.1 Emergency Updates Subscription

```typescript
// src/hooks/useEmergencySubscription.ts
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Emergency } from '@/types';

export function useEmergencySubscription(
  emergencyId: string,
  onUpdate: (emergency: Emergency) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`emergency:${emergencyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emergencies',
          filter: `id=eq.${emergencyId}`,
        },
        (payload) => {
          onUpdate(transformEmergency(payload.new));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [emergencyId]);
}
```

### 4.2 Response Status Updates

```typescript
// src/hooks/useResponseSubscription.ts

export function useResponseSubscription(
  responseId: string,
  onUpdate: (response: Response) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`response:${responseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'responses',
          filter: `id=eq.${responseId}`,
        },
        (payload) => {
          onUpdate(transformResponse(payload.new));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [responseId]);
}
```

### 4.3 Presence for Dispatch

```typescript
// Track online responders for dispatch dashboard

export function useResponderPresence(responderId: string) {
  useEffect(() => {
    const channel = supabase.channel('responders:online');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Online responders:', Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: responderId,
            online_at: new Date().toISOString(),
          });
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [responderId]);
}
```

---

## 5. TWILIO (SMS)

### 5.1 SMS Alerts

See NOTIFICATIONS_AND_ANALYTICS.md for full implementation.

### 5.2 Phone Verification

```typescript
// supabase/functions/send-verification-code/index.ts

export async function sendVerificationCode(phoneNumber: string) {
  const verification = await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: 'sms',
    });
  
  return verification.status;
}

export async function checkVerificationCode(phoneNumber: string, code: string) {
  const verificationCheck = await twilioClient.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code,
    });
  
  return verificationCheck.status === 'approved';
}
```

---

## 6. FUTURE INTEGRATIONS

### 6.1 TfL (Transport for London) API

**Purpose:** Real-time bus locations for Corridor Algorithm

```typescript
// Future: src/services/tfl.ts

interface TfLBusPosition {
  vehicleId: string;
  routeId: string;
  direction: string;
  currentLocation: Coordinates;
  nextStop: string;
  expectedArrival: string;
}

export async function getBusPositions(routeId: string): Promise<TfLBusPosition[]> {
  const response = await fetch(
    `https://api.tfl.gov.uk/Line/${routeId}/Arrivals?app_key=${TFL_API_KEY}`
  );
  
  const data = await response.json();
  
  return data.map((bus: any) => ({
    vehicleId: bus.vehicleId,
    routeId: bus.lineId,
    direction: bus.direction,
    currentLocation: {
      latitude: bus.currentLocation.lat,
      longitude: bus.currentLocation.lon,
    },
    nextStop: bus.stationName,
    expectedArrival: bus.expectedArrival,
  }));
}
```

### 6.2 What3Words API

**Purpose:** Precise location communication

```typescript
// Future: src/services/what3words.ts

export async function convertToWhat3Words(location: Coordinates): Promise<string> {
  const response = await fetch(
    `https://api.what3words.com/v3/convert-to-3wa?` +
    `coordinates=${location.latitude},${location.longitude}` +
    `&key=${WHAT3WORDS_API_KEY}`
  );
  
  const data = await response.json();
  return data.words; // e.g., "filled.count.soap"
}

export async function convertFromWhat3Words(words: string): Promise<Coordinates> {
  const response = await fetch(
    `https://api.what3words.com/v3/convert-to-coordinates?` +
    `words=${words}` +
    `&key=${WHAT3WORDS_API_KEY}`
  );
  
  const data = await response.json();
  return {
    latitude: data.coordinates.lat,
    longitude: data.coordinates.lng,
  };
}
```

### 6.3 NHS Ambulance CAD Integration

**Purpose:** Direct integration with ambulance dispatch

```typescript
// Future: CAD integration specification

interface CADEmergency {
  cadIncidentId: string;
  incidentType: string;
  priority: 'C1' | 'C2' | 'C3' | 'C4';
  location: {
    coordinates: Coordinates;
    address: string;
    what3words?: string;
  };
  dispatchTime: string;
  ambulanceEta?: number;
  patientInfo?: {
    age?: number;
    sex?: string;
    chiefComplaint: string;
  };
}

// Webhook from CAD system
export async function handleCADWebhook(payload: CADEmergency) {
  // Create emergency in ProtaRes
  const emergency = await supabase.from('emergencies').insert({
    emergency_type: mapCADTypeToProtaRes(payload.incidentType),
    severity: mapCADPriorityToSeverity(payload.priority),
    location: `POINT(${payload.location.coordinates.longitude} ${payload.location.coordinates.latitude})`,
    location_address: payload.location.address,
    what3words: payload.location.what3words,
    ambulance_notified: true,
    ambulance_notified_at: payload.dispatchTime,
    ambulance_eta_minutes: payload.ambulanceEta,
    external_reference: payload.cadIncidentId,
  }).select().single();
  
  // Trigger responder alerts
  await triggerCorridorAlerts(emergency.data);
}
```

---

## 7. INTEGRATION SECURITY

### 7.1 API Key Management

```typescript
// All sensitive API keys stored in Supabase Edge Function secrets
// Never exposed to client

// Set secrets via Supabase CLI:
// supabase secrets set GMC_API_KEY=xxx
// supabase secrets set NMC_API_KEY=xxx
// supabase secrets set TWILIO_AUTH_TOKEN=xxx

// Access in Edge Functions:
const gmcApiKey = Deno.env.get('GMC_API_KEY');
```

### 7.2 Rate Limiting

```typescript
// supabase/functions/_shared/rateLimit.ts

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL'),
  token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
});

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return current <= limit;
}

// Usage:
const allowed = await checkRateLimit(`gmc_verify:${userId}`, 5, 3600);
if (!allowed) {
  throw new Error('Rate limit exceeded. Try again later.');
}
```

### 7.3 Webhook Verification

```typescript
// Verify webhooks from external services

export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const expectedSignature = crypto
    .createHmac('sha1', TWILIO_AUTH_TOKEN)
    .update(url + Object.entries(params).sort().map(([k, v]) => k + v).join(''))
    .digest('base64');
  
  return signature === expectedSignature;
}
```

---

*This document specifies all third-party integrations for ProtaRes.*
