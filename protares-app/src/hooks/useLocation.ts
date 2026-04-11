import { useEffect } from 'react';

import {
  requestLocationPermission,
  startForegroundTracking,
  stopTracking,
} from '@/services/location';
import { useLocationStore } from '@/stores/location';
import { useAuthStore } from '@/stores/auth';
import { captureException } from '@/lib/sentry';

/**
 * Ties the location tracking lifecycle to the responder's availability.
 * Starts tracking when available + consent, stops otherwise.
 */
export function useLocation() {
  const user = useAuthStore((s) => s.user);
  const setConsent = useLocationStore((s) => s.setConsent);
  const setTracking = useLocationStore((s) => s.setTracking);

  useEffect(() => {
    if (!user) return;

    setConsent(user.locationConsent);

    let cancelled = false;

    async function sync() {
      if (!user) return;
      if (user.availability === 'available' && user.locationConsent) {
        const status = await requestLocationPermission();
        if (cancelled) return;
        if (status === 'granted') {
          try {
            await startForegroundTracking();
            setTracking(true);
          } catch (err) {
            captureException(err, { context: 'useLocation.start' });
          }
        }
      } else {
        stopTracking();
        setTracking(false);
      }
    }

    void sync();
    return () => {
      cancelled = true;
      stopTracking();
      setTracking(false);
    };
  }, [user, setConsent, setTracking]);
}
