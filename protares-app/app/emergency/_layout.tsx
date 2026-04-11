import { Stack } from 'expo-router';

import { colors } from '@/config/theme';

export default function EmergencyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
