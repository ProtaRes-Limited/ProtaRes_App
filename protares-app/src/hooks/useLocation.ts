/**
 * Ties the location tracking lifecycle to the responder's availability and
 * active emergency state.
 *
 *   • Requests background permission first; falls back to foreground-only if
 *     the user grants "While in use" instead of "Allow always".
 *   • Switches automatically to navigation mode (5 s / 10 m / BestForNavigation)
 *     when activeEmergency is set, then returns to standard mode when cleared.
 *   • Background task persists independently of component lifecycle — it is
 *     only stopped when the user goes unavailable or revokes consent.
 */

import { useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import {
  requestLocationPermission,
  requestBackgroundLocationPermission,
  startBackgroundTracking,
  startForegroundTracking,
  stopBackgroundTracking,
  stopForegroundTracking,
  setTrackingMode,
} from '@/services/location';
import { BACKGROUND_LOCATION_TASK } from '@/tasks/background-location';
import { useLocationStore } from '@/stores/location';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import { captureException } from '@/lib/sentry';

export function useLocation() {
  const user = useAuthStore((s) => s.user);
  const setConsent = useLocationStore((s) => s.setConsent);
  const setTracking = useLocationStore((s) => s.setTracking);
  const activeEmergency = useEmergencyStore((s) => s.activeEmergency);

  // ─── Sync consent flag into location store ──────────────────────────────
  useEffect(() => {
    if (user) setConsent(user.locationConsent);
  }, [user?.locationConsent, setConsent]);

  // ─── Start / stop tracking when availability or consent changes ─────────
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function sync() {
      if (!user || cancelled) return;

      const shouldTrack =
        user.availability === 'available' && user.locationConsent;

      if (shouldTrack) {
        // Step 1: foreground permission (required)
        const fgStatus = await requestLocationPermission();
        if (cancelled) return;
        if (fgStatus !== 'granted') {
          setTracking(false);
          return;
        }

        // Step 2: background permission (preferred, graceful fallback if denied)
        const bgGranted = await requestBackgroundLocationPermission();
        if (cancelled) return;

        try {
          if (bgGranted) {
            await startBackgroundTracking('standard');
          } else {
            await startForegroundTracking('standard');
          }
          setTracking(true);
        } catch (err) {
          captureException(err, { context: 'useLocation.start' });
          setTracking(false);
        }
      } else {
        // Unavailable or no consent — stop everything.
        void stopBackgroundTracking().catch(() => {});
        stopForegroundTracking();
        setTracking(false);
      }
    }

    void sync();

    return () => {
      cancelled = true;
      // Note: we do NOT stop the background task here — it should keep running
      // while the user is available even if this component re-renders.
      // Stopping happens only in the shouldTrack === false branch above.
    };
  }, [user?.id, user?.availability, user?.locationConsent, setTracking]);

  // ─── Adaptive mode: switch to navigation when responding to an emergency ─
  useEffect(() => {
    const mode = activeEmergency ? 'navigation' : 'standard';
    void setTrackingMode(mode).catch(() => {});
  }, [activeEmergency]);

  // ─── On mount: sync tracking indicator if background task is already running
  useEffect(() => {
    async function hydrate() {
      const running = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_LOCATION_TASK
      ).catch(() => false);
      if (running) {
        setTracking(true);
        // Populate location store with last known position so the home screen
        // isn't blank until the next GPS point arrives.
        const pos = await Location.getLastKnownPositionAsync({
          maxAge: 60_000,
        }).catch(() => null);
        if (pos) {
          useLocationStore.getState().setCurrent({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      }
    }
    void hydrate();
  }, [setTracking]);
}
