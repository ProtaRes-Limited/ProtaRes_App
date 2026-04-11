import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/config/theme';

interface Props extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ elevated = false, padded = true, style, children, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.lg },
  elevated: { ...shadows.md, borderWidth: 0 },
});
