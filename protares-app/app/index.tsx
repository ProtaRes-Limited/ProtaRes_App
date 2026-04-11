import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/auth';

/**
 * Entry route. The root `AuthGate` in `_layout.tsx` already routes based
 * on session state; this file exists so Expo Router has a concrete `/`.
 */
export default function Index() {
  const session = useAuthStore((s) => s.session);
  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
