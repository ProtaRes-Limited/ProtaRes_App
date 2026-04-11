import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/config/theme';

interface Props {
  label?: string;
  size?: 'small' | 'large';
  inverse?: boolean;
}

export function LoadingSpinner({ label, size = 'large', inverse = false }: Props) {
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator
        size={size}
        color={inverse ? colors.white : colors.nhsBlue}
      />
      {label ? (
        <Text style={[styles.label, inverse && styles.labelInverse]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  labelInverse: { color: colors.white },
});
