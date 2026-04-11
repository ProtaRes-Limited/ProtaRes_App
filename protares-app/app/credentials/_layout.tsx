import { Stack } from 'expo-router';

import { colors } from '@/config/theme';

export default function CredentialsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
