import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import type { Responder, Emergency } from '@/types';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function useDevMockData() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const addPendingAlert = useEmergencyStore((s) => s.addPendingAlert);
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);

  useEffect(() => {
    if (__DEV__ && !user) {
      const mockUser: Responder = {
        id: 'dev-user-001',
        email: 'dr.sarah.johnson@nhs.net',
        phone: '+447700900123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Dr. Sarah Johnson',
        profilePhotoUrl: null,
        tier: 'tier1_active_healthcare',
        availability: 'available',
        currentLocation: { latitude: 51.5074, longitude: -0.1278 },
        currentTransportMode: 'stationary',
        locationUpdatedAt: new Date().toISOString(),
        alertRadiusKm: 5,
        smsFallbackEnabled: true,
        pushEnabled: true,
        totalResponses: 47,
        totalAccepted: 12,
        totalDeclined: 3,
        averageResponseTimeSeconds: 272,
        locationConsent: true,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      setUser(mockUser);
    }

    if (__DEV__ && pendingAlerts.length === 0) {
      const mockAlert: Emergency = {
        id: 'emg-001',
        emergencyType: 'cardiac_arrest',
        severity: 'critical',
        status: 'dispatched',
        location: { latitude: 51.5095, longitude: -0.1335 },
        locationAddress: 'Victoria Station, London SW1V 1JU',
        locationDescription: 'Platform 3, near ticket barriers',
        what3words: null,
        reportedBy: null,
        reporterPhone: '+447700900456',
        reporterName: 'Witness',
        description: 'Man collapsed on platform, not breathing',
        casualtyCount: 1,
        casualtiesConscious: false,
        casualtiesBreathing: false,
        witnessStreamActive: false,
        witnessStreamUrl: null,
        equipmentRequested: ['aed'],
        equipmentDelivered: [],
        ambulanceNotified: true,
        ambulanceNotifiedAt: new Date().toISOString(),
        ambulanceEtaMinutes: 12,
        policeNotified: false,
        fireNotified: false,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        distanceMeters: 450,
        etaMinutes: 3,
      };
      addPendingAlert(mockAlert);
    }
  }, [setUser, user, addPendingAlert, pendingAlerts.length]);
}

export default function RootLayout() {
  useDevMockData();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="emergency" options={{ presentation: 'modal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
