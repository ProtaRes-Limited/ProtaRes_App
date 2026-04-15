import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);

  // Non-admins are silently bounced to home — the route never renders
  if (!user?.isAdmin) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
