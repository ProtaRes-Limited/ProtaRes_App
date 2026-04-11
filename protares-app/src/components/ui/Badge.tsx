import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/config/theme';

export type BadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'critical'
  | 'emergency';

interface Props {
  label: string;
  variant?: BadgeVariant;
}

const palette: Record<BadgeVariant, { bg: string; fg: string }> = {
  neutral: { bg: colors.grey1, fg: colors.textPrimary },
  info: { bg: colors.nhsAquaBlue, fg: colors.white },
  success: { bg: colors.successGreen, fg: colors.white },
  warning: { bg: colors.warmYellow, fg: colors.textPrimary },
  critical: { bg: colors.darkPink, fg: colors.white },
  emergency: { bg: colors.emergencyRed, fg: colors.white },
};

export function Badge({ label, variant = 'neutral' }: Props) {
  const { bg, fg } = palette[variant];
  return (
    <View
      style={[styles.badge, { backgroundColor: bg }]}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
