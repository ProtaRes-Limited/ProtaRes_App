import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';
import { captureException } from '@/lib/sentry';

/**
 * Notification service. Registers an Expo push token with Supabase and
 * handles foreground / background notification behaviour.
 *
 *   • Android 13+ requires runtime POST_NOTIFICATIONS permission.
 *   • The `emergency` channel plays a custom sound and bypasses DND
 *     on Android — see app.config.ts for sound declaration.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensurePermissionsAndRegister(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('emergency', {
      name: 'Emergency alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 200, 500],
      bypassDnd: true,
      lightColor: '#DA291C',
    });
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;
  if (status !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }
  if (status !== 'granted') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    await persistTokenIfPossible(token.data);
    return token.data;
  } catch (err) {
    captureException(err, { context: 'getExpoPushTokenAsync' });
    return null;
  }
}

async function persistTokenIfPossible(token: string) {
  const userId = useAuthStore.getState().session?.user?.id;
  if (!userId) return;
  try {
    // The live schema has a dedicated `push_tokens` table — use it
    // instead of shoehorning the token into audit_log.
    await supabase
      .from('push_tokens')
      .upsert(
        {
          responder_id: userId,
          token,
          platform: Platform.OS,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'responder_id,token' }
      )
      .throwOnError();
  } catch (err) {
    captureException(err, { context: 'persistPushToken' });
  }
}
