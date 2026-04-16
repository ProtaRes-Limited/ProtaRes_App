/**
 * Location tracking service.
 *
 * Two tracking strategies:
 *   1. Background (preferred) — uses startLocationUpdatesAsync + a registered
 *      TaskManager task. Survives app suspension, screen lock, and (on Android)
 *      even after the user swipes the app away. Requires "Allow always" permission.
 *   2. Foreground fallback — uses watchPositionAsync. Stops when the app is
 *      backgrounded. Used when the user grants "While in use" only.
 *
 * Two tracking modes (adaptive):
 *   • standard   — Balanced accuracy, 20 s / 50 m. Used when available but
 *                  not yet responding to an active emergency.
 *   • navigation — BestForNavigation accuracy, 5 s / 10 m. Switches on
 *                  automatically when the responder accepts an emergency.
 *
 * Rules (NHS DSPT data minimisation):
 *   • Only track after explicit consent (location_consent = true).
 *   • Standard mode by default; navigation mode only when actively responding.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { classifyTransportMode } from '@/lib/transport-classifier';
import { updateLocation } from './responders';
import { useLocationStore } from '@/stores/location';
import { captureException } from '@/lib/sentry';
import { BACKGROUND_LOCATION_TASK } from '@/tasks/background-location';
import type { Coordinates } from '@/types';

export type TrackingMode = 'standard' | 'navigation';

const STANDARD_OPTIONS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 20_000,
  distanceInterval: 50,
};

const NAVIGATION_OPTIONS = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5_000,
  distanceInterval: 10,
};

// ─── State ───────────────────────────────────────────────────────────────────

let activeSubscription: Location.LocationSubscription | null = null;
let currentMode: TrackingMode = 'standard';
const recentPoints: Array<Coordinates & { timestamp: number }> = [];

// ─── Permission helpers ───────────────────────────────────────────────────────

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

// ─── Background tracking ──────────────────────────────────────────────────────

export async function startBackgroundTracking(
  mode: TrackingMode = 'standard'
): Promise<void> {
  currentMode = mode;
  const options = mode === 'navigation' ? NAVIGATION_OPTIONS : STANDARD_OPTIONS;

  // Stop first so startLocationUpdatesAsync picks up the new options cleanly.
  const alreadyRunning = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK
  );
  if (alreadyRunning) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    ...options,
    // Shows the blue location indicator on iOS and a foreground service
    // notification on Android while the task is active.
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'ProtaRes — location active',
      notificationBody:
        mode === 'navigation'
          ? 'High-accuracy tracking while responding to an emergency'
          : 'Monitoring for nearby emergencies',
      notificationColor: '#005EB8',
    },
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.Other,
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const running = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK
  );
  if (running) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

// ─── Foreground tracking (fallback) ──────────────────────────────────────────

export async function startForegroundTracking(
  mode: TrackingMode = 'standard'
): Promise<void> {
  // Remove any existing subscription so we can restart with new options.
  if (activeSubscription) {
    activeSubscription.remove();
    activeSubscription = null;
  }
  currentMode = mode;
  const options = mode === 'navigation' ? NAVIGATION_OPTIONS : STANDARD_OPTIONS;

  activeSubscription = await Location.watchPositionAsync(
    options,
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
      }).catch((err) =>
        captureException(err, { context: 'foregroundTracking.updateLocation' })
      );
    }
  );
}

export function stopForegroundTracking(): void {
  activeSubscription?.remove();
  activeSubscription = null;
  recentPoints.length = 0;
}

// ─── Adaptive mode switching ──────────────────────────────────────────────────

/**
 * Switch between standard and navigation modes without stopping tracking.
 * Called by useLocation when activeEmergency changes.
 */
export async function setTrackingMode(mode: TrackingMode): Promise<void> {
  if (mode === currentMode) return;

  const bgRunning = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK
  );
  if (bgRunning) {
    await startBackgroundTracking(mode);
    return;
  }

  if (activeSubscription) {
    await startForegroundTracking(mode);
  }
}

// ─── Unified stop ─────────────────────────────────────────────────────────────

export function stopTracking(): void {
  stopForegroundTracking();
  void stopBackgroundTracking().catch(() => {});
}
