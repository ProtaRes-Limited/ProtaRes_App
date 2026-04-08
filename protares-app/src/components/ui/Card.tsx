import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing, borderRadius, shadows } from '@/config/theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'emergency' | 'active';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: colors.white,
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  emergency: {
    backgroundColor: colors.emergency[50],
    borderWidth: 2,
    borderColor: colors.emergency[500],
  },
  active: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
};

export function Card({ children, variant = 'default', onPress, style }: CardProps) {
  const combinedStyle = [styles.card, variantStyles[variant], style];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...combinedStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={combinedStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  pressed: {
    opacity: 0.9,
  },
});
