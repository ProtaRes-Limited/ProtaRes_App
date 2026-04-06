# STATE AND SERVICES - ProtaRes

## State Management & API Layer

---

## 1. STATE MANAGEMENT OVERVIEW

### Architecture
```
┌─────────────────────────────────────────────┐
│                    UI                        │
├─────────────────────────────────────────────┤
│         React Query (Server State)           │
│    - Emergencies, Responses, Credentials     │
├─────────────────────────────────────────────┤
│           Zustand (Client State)             │
│    - Auth, Location, UI, Settings            │
├─────────────────────────────────────────────┤
│              Supabase Client                 │
│    - Database, Auth, Realtime, Storage       │
└─────────────────────────────────────────────┘
```

---

## 2. TYPESCRIPT TYPES

### 2.1 Core Types

```typescript
// src/types/index.ts

// ============ ENUMS ============

export type ResponderTier = 
  | 'tier1_active_healthcare'
  | 'tier2_retired_healthcare'
  | 'tier3_first_aid'
  | 'tier4_witness';

export type AvailabilityStatus = 
  | 'available'
  | 'busy'
  | 'unavailable'
  | 'do_not_disturb';

export type EmergencyType =
  | 'cardiac_arrest'
  | 'heart_attack'
  | 'road_accident'
  | 'pedestrian_incident'
  | 'cyclist_incident'
  | 'stroke'
  | 'diabetic_emergency'
  | 'anaphylaxis'
  | 'seizure'
  | 'breathing_difficulty'
  | 'stabbing'
  | 'assault'
  | 'serious_fall'
  | 'choking'
  | 'drowning'
  | 'burn'
  | 'electrocution'
  | 'overdose'
  | 'other_medical'
  | 'other_trauma';

export type EmergencySeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type EmergencyStatus =
  | 'reported'
  | 'dispatched'
  | 'responder_en_route'
  | 'responder_on_scene'
  | 'ems_en_route'
  | 'ems_on_scene'
  | 'handover_complete'
  | 'resolved'
  | 'cancelled'
  | 'no_response';

export type ResponseStatus =
  | 'alerted'
  | 'accepted'
  | 'declined'
  | 'en_route'
  | 'on_scene'
  | 'intervening'
  | 'completing'
  | 'completed'
  | 'withdrawn';

export type TransportMode =
  | 'stationary'
  | 'walking'
  | 'cycling'
  | 'bus'
  | 'train'
  | 'driving'
  | 'unknown';

export type EquipmentType =
  | 'aed'
  | 'trauma_kit'
  | 'burn_kit'
  | 'naloxone_kit'
  | 'obstetric_kit'
  | 'basic_medical_kit'
  | 'oxygen'
  | 'cutting_gear';

// ============ INTERFACES ============

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Responder {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePhotoUrl: string | null;
  tier: ResponderTier;
  availability: AvailabilityStatus;
  currentLocation: Coordinates | null;
  currentTransportMode: TransportMode;
  locationUpdatedAt: string | null;
  alertRadiusKm: number;
  smsFallbackEnabled: boolean;
  pushEnabled: boolean;
  totalResponses: number;
  totalAccepted: number;
  totalDeclined: number;
  averageResponseTimeSeconds: number | null;
  locationConsent: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
}

export interface Credential {
  id: string;
  responderId: string;
  credentialType: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired' | 'revoked';
  verifiedAt: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Emergency {
  id: string;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  location: Coordinates;
  locationAddress: string | null;
  locationDescription: string | null;
  what3words: string | null;
  reportedBy: string | null;
  reporterPhone: string | null;
  reporterName: string | null;
  description: string | null;
  casualtyCount: number;
  casualtiesConscious: boolean | null;
  casualtiesBreathing: boolean | null;
  witnessStreamActive: boolean;
  witnessStreamUrl: string | null;
  equipmentRequested: EquipmentType[];
  equipmentDelivered: EquipmentType[];
  ambulanceNotified: boolean;
  ambulanceNotifiedAt: string | null;
  ambulanceEtaMinutes: number | null;
  policeNotified: boolean;
  fireNotified: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  // Computed
  distanceMeters?: number;
  etaMinutes?: number;
}

export interface Response {
  id: string;
  emergencyId: string;
  responderId: string;
  alertedAt: string;
  alertMethod: 'push' | 'sms' | 'both';
  estimatedEtaSeconds: number | null;
  status: ResponseStatus;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  departedAt: string | null;
  arrivedAt: string | null;
  transportMode: TransportMode | null;
  interventionsPerformed: string[];
  equipmentUsed: EquipmentType[];
  notes: string | null;
  handoverAt: string | null;
  handoverTo: string | null;
  completedAt: string | null;
  feedbackRating: number | null;
  feedbackNotes: string | null;
  // Relations
  emergency?: Emergency;
  responder?: Responder;
}

export interface EquipmentLocation {
  id: string;
  equipmentType: EquipmentType;
  name: string | null;
  description: string | null;
  location: Coordinates;
  locationAddress: string | null;
  locationDetails: string | null;
  isAvailable: boolean;
  availableHours: string | null;
  accessInstructions: string | null;
  distanceMeters?: number;
}

export interface GreenBadge {
  responderId: string;
  name: string;
  tier: ResponderTier;
  credentialType: string | null;
  verified: boolean;
  issuedAt: string;
  expiresAt: string;
  qrData: string; // Encrypted QR code data
}

// ============ API TYPES ============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## 3. ZUSTAND STORES

### 3.1 Auth Store

```typescript
// src/stores/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Responder } from '@/types';

interface AuthState {
  // State
  user: Responder | null;
  session: { accessToken: string; refreshToken: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: Responder | null) => void;
  setSession: (session: { accessToken: string; refreshToken: string } | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<Responder>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setSession: (session) => set({ session }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      }),
      
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'protares-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        session: state.session,
        // Don't persist user - fetch fresh on app load
      }),
    }
  )
);
```

### 3.2 Location Store

```typescript
// src/stores/location.ts
import { create } from 'zustand';
import { Coordinates, TransportMode } from '@/types';

interface LocationState {
  // State
  currentLocation: Coordinates | null;
  locationPermission: 'granted' | 'denied' | 'undetermined';
  isTracking: boolean;
  transportMode: TransportMode;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  lastUpdated: Date | null;
  
  // Actions
  setLocation: (location: Coordinates) => void;
  setLocationPermission: (permission: 'granted' | 'denied' | 'undetermined') => void;
  setTracking: (tracking: boolean) => void;
  setTransportMode: (mode: TransportMode) => void;
  updateLocationDetails: (details: {
    accuracy?: number;
    heading?: number;
    speed?: number;
  }) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  locationPermission: 'undetermined',
  isTracking: false,
  transportMode: 'unknown',
  accuracy: null,
  heading: null,
  speed: null,
  lastUpdated: null,
  
  setLocation: (location) => set({ 
    currentLocation: location,
    lastUpdated: new Date(),
  }),
  
  setLocationPermission: (permission) => set({ locationPermission: permission }),
  
  setTracking: (isTracking) => set({ isTracking }),
  
  setTransportMode: (transportMode) => set({ transportMode }),
  
  updateLocationDetails: (details) => set((state) => ({
    ...state,
    ...details,
  })),
  
  clearLocation: () => set({
    currentLocation: null,
    accuracy: null,
    heading: null,
    speed: null,
    lastUpdated: null,
  }),
}));
```

### 3.3 Emergency Store

```typescript
// src/stores/emergency.ts
import { create } from 'zustand';
import { Emergency, Response, ResponseStatus } from '@/types';

interface EmergencyState {
  // Active emergency response
  activeEmergency: Emergency | null;
  activeResponse: Response | null;
  
  // Incoming alerts
  pendingAlerts: Emergency[];
  
  // State
  isResponding: boolean;
  responseStatus: ResponseStatus | null;
  
  // Actions
  setActiveEmergency: (emergency: Emergency | null) => void;
  setActiveResponse: (response: Response | null) => void;
  addPendingAlert: (emergency: Emergency) => void;
  removePendingAlert: (emergencyId: string) => void;
  clearPendingAlerts: () => void;
  setResponseStatus: (status: ResponseStatus | null) => void;
  clearActiveResponse: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  activeEmergency: null,
  activeResponse: null,
  pendingAlerts: [],
  isResponding: false,
  responseStatus: null,
  
  setActiveEmergency: (emergency) => set({ 
    activeEmergency: emergency,
    isResponding: !!emergency,
  }),
  
  setActiveResponse: (response) => set({ 
    activeResponse: response,
    responseStatus: response?.status || null,
  }),
  
  addPendingAlert: (emergency) => set((state) => ({
    pendingAlerts: [...state.pendingAlerts, emergency],
  })),
  
  removePendingAlert: (emergencyId) => set((state) => ({
    pendingAlerts: state.pendingAlerts.filter(e => e.id !== emergencyId),
  })),
  
  clearPendingAlerts: () => set({ pendingAlerts: [] }),
  
  setResponseStatus: (status) => set({ responseStatus: status }),
  
  clearActiveResponse: () => set({
    activeEmergency: null,
    activeResponse: null,
    isResponding: false,
    responseStatus: null,
  }),
}));
```

### 3.4 Settings Store

```typescript
// src/stores/settings.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Preferences
  alertRadius: number; // km
  smsFallbackEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: 'system' | 'light' | 'dark';
  
  // Consents
  locationConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  
  // Actions
  setAlertRadius: (radius: number) => void;
  setSmsFallback: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setDarkMode: (mode: 'system' | 'light' | 'dark') => void;
  setLocationConsent: (consent: boolean) => void;
  setAnalyticsConsent: (consent: boolean) => void;
  setMarketingConsent: (consent: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      alertRadius: 5,
      smsFallbackEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      darkMode: 'system',
      locationConsent: false,
      analyticsConsent: true,
      marketingConsent: false,
      
      setAlertRadius: (alertRadius) => set({ alertRadius }),
      setSmsFallback: (smsFallbackEnabled) => set({ smsFallbackEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setLocationConsent: (locationConsent) => set({ locationConsent }),
      setAnalyticsConsent: (analyticsConsent) => set({ analyticsConsent }),
      setMarketingConsent: (marketingConsent) => set({ marketingConsent }),
    }),
    {
      name: 'protares-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 4. API SERVICES

### 4.1 Supabase Client

```typescript
// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4.2 Auth Service

```typescript
// src/services/auth.ts
import { supabase } from './supabase';
import { Responder } from '@/types';

export const authService = {
  async signUp(email: string, password: string, profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');
    
    // Create responder profile
    const { error: profileError } = await supabase
      .from('responders')
      .insert({
        id: authData.user.id,
        email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
      });
    
    if (profileError) throw profileError;
    
    return authData;
  },
  
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  async getProfile(): Promise<Responder | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return transformResponder(data);
  },
  
  async updateProfile(updates: Partial<Responder>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('responders')
      .update(transformResponderForDb(updates))
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return transformResponder(data);
  },
  
  async setAvailability(status: AvailabilityStatus) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('responders')
      .update({ availability: status })
      .eq('id', user.id);
    
    if (error) throw error;
  },
};

// Transform database row to app model
function transformResponder(row: any): Responder {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`,
    profilePhotoUrl: row.profile_photo_url,
    tier: row.tier,
    availability: row.availability,
    currentLocation: row.current_location ? {
      latitude: row.current_location.coordinates[1],
      longitude: row.current_location.coordinates[0],
    } : null,
    currentTransportMode: row.current_transport_mode,
    locationUpdatedAt: row.location_updated_at,
    alertRadiusKm: row.alert_radius_km,
    smsFallbackEnabled: row.sms_fallback_enabled,
    pushEnabled: row.push_enabled,
    totalResponses: row.total_responses,
    totalAccepted: row.total_accepted,
    totalDeclined: row.total_declined,
    averageResponseTimeSeconds: row.average_response_time_seconds,
    locationConsent: row.location_consent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActiveAt: row.last_active_at,
  };
}
```

### 4.3 Emergency Service

```typescript
// src/services/emergencies.ts
import { supabase } from './supabase';
import { Emergency, EmergencyType, Coordinates } from '@/types';

export const emergencyService = {
  async getNearbyEmergencies(location: Coordinates, radiusKm: number = 10) {
    const { data, error } = await supabase.rpc('find_nearby_emergencies', {
      lat: location.latitude,
      lng: location.longitude,
      radius_km: radiusKm,
    });
    
    if (error) throw error;
    return data.map(transformEmergency);
  },
  
  async getEmergency(id: string): Promise<Emergency> {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return transformEmergency(data);
  },
  
  async reportEmergency(report: {
    emergencyType: EmergencyType;
    location: Coordinates;
    description?: string;
    casualtyCount?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('emergencies')
      .insert({
        emergency_type: report.emergencyType,
        location: `POINT(${report.location.longitude} ${report.location.latitude})`,
        description: report.description,
        casualty_count: report.casualtyCount || 1,
        reported_by: user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformEmergency(data);
  },
  
  async acceptEmergency(emergencyId: string, etaSeconds: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('responses')
      .insert({
        emergency_id: emergencyId,
        responder_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        estimated_eta_seconds: etaSeconds,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async declineEmergency(emergencyId: string, reason?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('responses')
      .insert({
        emergency_id: emergencyId,
        responder_id: user.id,
        status: 'declined',
        declined_at: new Date().toISOString(),
        decline_reason: reason,
      });
    
    if (error) throw error;
  },
  
  async updateResponseStatus(
    responseId: string, 
    status: ResponseStatus,
    additionalData?: Record<string, any>
  ) {
    const { error } = await supabase
      .from('responses')
      .update({
        status,
        ...additionalData,
      })
      .eq('id', responseId);
    
    if (error) throw error;
  },
  
  // Subscribe to emergency updates (Realtime)
  subscribeToEmergency(emergencyId: string, callback: (emergency: Emergency) => void) {
    return supabase
      .channel(`emergency:${emergencyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergencies',
          filter: `id=eq.${emergencyId}`,
        },
        (payload) => {
          callback(transformEmergency(payload.new));
        }
      )
      .subscribe();
  },
};
```

### 4.4 Location Service

```typescript
// src/services/location.ts
import * as Location from 'expo-location';
import { supabase } from './supabase';
import { Coordinates, TransportMode } from '@/types';
import { classifyTransportMode } from '@/lib/transport-classifier';

let locationSubscription: Location.LocationSubscription | null = null;

export const locationService = {
  async requestPermissions() {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      return 'denied';
    }
    
    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    return background === 'granted' ? 'granted' : 'foreground_only';
  },
  
  async getCurrentLocation(): Promise<Coordinates> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  },
  
  startTracking(
    onLocation: (location: Coordinates, details: {
      accuracy: number;
      heading: number | null;
      speed: number | null;
      transportMode: TransportMode;
    }) => void,
    intervalMs: number = 5000
  ) {
    let lastLocations: Array<{ coords: Coordinates; timestamp: number }> = [];
    
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: intervalMs,
        distanceInterval: 10, // Also update if moved 10m
      },
      (location) => {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        // Track last 5 locations for transport mode classification
        lastLocations.push({ coords, timestamp: location.timestamp });
        if (lastLocations.length > 5) lastLocations.shift();
        
        const transportMode = classifyTransportMode(lastLocations);
        
        onLocation(coords, {
          accuracy: location.coords.accuracy || 0,
          heading: location.coords.heading,
          speed: location.coords.speed,
          transportMode,
        });
      }
    );
  },
  
  async updateServerLocation(
    location: Coordinates,
    transportMode: TransportMode,
    heading?: number,
    speed?: number
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Update current location
    await supabase
      .from('responders')
      .update({
        current_location: `POINT(${location.longitude} ${location.latitude})`,
        current_transport_mode: transportMode,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    // Add to location history
    await supabase
      .from('location_history')
      .insert({
        responder_id: user.id,
        location: `POINT(${location.longitude} ${location.latitude})`,
        heading,
        speed_mps: speed,
        transport_mode: transportMode,
      });
  },
  
  stopTracking() {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
  },
};
```

---

## 5. REACT QUERY HOOKS

### 5.1 Query Client Setup

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 5.2 Emergency Hooks

```typescript
// src/hooks/useEmergencies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '@/services/emergencies';
import { useLocationStore } from '@/stores/location';

export function useNearbyEmergencies() {
  const currentLocation = useLocationStore((s) => s.currentLocation);
  
  return useQuery({
    queryKey: ['emergencies', 'nearby', currentLocation],
    queryFn: () => {
      if (!currentLocation) return [];
      return emergencyService.getNearbyEmergencies(currentLocation);
    },
    enabled: !!currentLocation,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useEmergency(id: string) {
  return useQuery({
    queryKey: ['emergency', id],
    queryFn: () => emergencyService.getEmergency(id),
    enabled: !!id,
  });
}

export function useAcceptEmergency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ emergencyId, etaSeconds }: { 
      emergencyId: string; 
      etaSeconds: number;
    }) => emergencyService.acceptEmergency(emergencyId, etaSeconds),
    onSuccess: (_, { emergencyId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergency', emergencyId] });
      queryClient.invalidateQueries({ queryKey: ['emergencies', 'nearby'] });
    },
  });
}

export function useDeclineEmergency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ emergencyId, reason }: { 
      emergencyId: string; 
      reason?: string;
    }) => emergencyService.declineEmergency(emergencyId, reason),
    onSuccess: (_, { emergencyId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergencies', 'nearby'] });
    },
  });
}

export function useReportEmergency() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emergencyService.reportEmergency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}
```

### 5.3 Profile Hooks

```typescript
// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    onSuccess: (data) => {
      if (data) setUser(data);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      queryClient.setQueryData(['profile'], data);
    },
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.setAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

---

## 6. REALTIME SUBSCRIPTIONS

```typescript
// src/hooks/useRealtimeEmergency.ts
import { useEffect } from 'react';
import { emergencyService } from '@/services/emergencies';
import { useEmergencyStore } from '@/stores/emergency';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeEmergency(emergencyId: string | null) {
  const queryClient = useQueryClient();
  const setActiveEmergency = useEmergencyStore((s) => s.setActiveEmergency);
  
  useEffect(() => {
    if (!emergencyId) return;
    
    const subscription = emergencyService.subscribeToEmergency(
      emergencyId,
      (emergency) => {
        // Update store
        setActiveEmergency(emergency);
        // Update query cache
        queryClient.setQueryData(['emergency', emergencyId], emergency);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [emergencyId]);
}
```

---

*This document defines all state management and API interaction patterns for ProtaRes.*
