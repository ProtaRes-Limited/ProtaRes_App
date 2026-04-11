import * as Location from 'expo-location';

import { classifyTransportMode } from '@/lib/transport-classifier';
import { updateLocation } from './responders';
import { useLocationStore } from '@/stores/location';
import { captureException } from '@/lib/sentry';
import type { Coordinates } from '@/types';

/**
 * Location tracking service.
 *
 * Rules (from §12 and NHS DSPT data minimisation):
 *   • Only start tracking AFTER explicit consent (location_consent = true)
 *   • Use `Balanced` accuracy by default; switch to `BestForNavigation` only
 *     after accepting an emergency
 *   • Reduce polling frequency when stationary to save battery
 *   • Push every point to `updateLocation` so PostGIS has the latest row
 *     and the classifier can adjust the transport mode server-side
 */

let activeSubscription: Location.LocationSubscription | null = null;
const recentPoints: Array<Coordinates & { timestamp: number }> = [];

export async function requestLocationPermission(): Promise<
  'granted' | 'denied' | 'restricted'
> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'restricted';
}

export async function requestBackgroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  try {
    const result = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    };
  } catch (err) {
    captureException(err, { context: 'getCurrentCoordinates' });
    return null;
  }
}

export async function startForegroundTracking() {
  if (activeSubscription) return;

  activeSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 20_000,
      distanceInterval: 50,
    },
    (position) => {
      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      recentPoints.push({ ...coords, timestamp: Date.now() });
      if (recentPoints.length > 20) recentPoints.shift();

      const transportMode = classifyTransportMode(recentPoints);
      useLocationStore.getState().setCurrent(coords, transportMode);

      void updateLocation(coords, {
        accuracyMeters: position.coords.accuracy ?? undefined,
        speedMps: position.coords.speed ?? undefined,
        headingDegrees: position.coords.heading ?? undefined,
        transportMode,
      }).catch((err) => captureException(err, { context: 'updateLocation' }));
    }
  );
}

export function stopTracking() {
  activeSubscription?.remove();
  activeSubscription = null;
  recentPoints.length = 0;
}
