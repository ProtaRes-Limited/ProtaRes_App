import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { ensurePermissionsAndRegister } from '@/services/notifications';
import { captureException } from '@/lib/sentry';
import { useAuthStore } from '@/stores/auth';

/**
 * Wires notification tap-through: tapping an emergency alert opens
 * the specific emergency detail screen. Responders wake up from a
 * push and are taken straight to the Accept/Decline UI.
 */
export function useNotificationListeners() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!session) return;

    void ensurePermissionsAndRegister().catch((err) =>
      captureException(err, { context: 'notifications.register' })
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { emergencyId?: string }
        | undefined;
      if (data?.emergencyId) {
        router.push({ pathname: '/emergency/[id]', params: { id: data.emergencyId } });
      }
    });

    return () => {
      responseSub.remove();
    };
  }, [session, router]);
}
