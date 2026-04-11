import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors, spacing, typography } from '@/config/theme';

export function OfflineBanner() {
  const { online } = useNetworkStatus();
  if (online) return null;
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <WifiOff size={16} color={colors.white} />
      <Text style={styles.text}>Offline — updates will sync when reconnected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warmYellow,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
