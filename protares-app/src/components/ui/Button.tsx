import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native';

import { colors, radii, spacing, touchTargets, typography } from '@/config/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'emergency';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'emergency';

interface Props extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Button — NHS-aligned, WCAG 2.2 AA.
 *
 *   • `emergency` variant is reserved for life-critical actions
 *     (Accept Emergency, Call 999). It is always ≥ 56px tall.
 *   • `primary` uses NHS Blue with white text → 4.96:1 contrast.
 *   • Disabled state keeps 3:1 contrast on label per WCAG 1.4.3.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...rest
}: Props) {
  const containerStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant].container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabledContainer,
  ];

  const textStyle = [
    styles.text,
    sizeTextStyles[size],
    variantStyles[variant].text,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading, busy: loading }}
      accessibilityLabel={rest.accessibilityLabel ?? label}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'emergency' ? colors.white : colors.nhsBlue}
        />
      ) : (
        <View style={styles.row}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text style={textStyle} numberOfLines={1}>
            {label}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const variantStyles: Record<
  ButtonVariant,
  { container: object; text: object }
> = {
  primary: {
    container: { backgroundColor: colors.nhsBlue },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.nhsDarkBlue },
    text: { color: colors.textInverse },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.nhsBlue,
    },
    text: { color: colors.nhsBlue },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.nhsBlue },
  },
  emergency: {
    container: { backgroundColor: colors.emergencyRed },
    text: { color: colors.textInverse, fontWeight: '700' },
  },
};

const sizeStyles: Record<ButtonSize, object> = {
  sm: {
    minHeight: touchTargets.minimum,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  md: {
    minHeight: touchTargets.recommended,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lg: {
    minHeight: touchTargets.emergency,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emergency: {
    minHeight: touchTargets.emergency,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
};

const sizeTextStyles: Record<ButtonSize, object> = {
  sm: typography.bodySmall,
  md: typography.button,
  lg: typography.buttonLarge,
  emergency: typography.buttonLarge,
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  text: {
    textAlign: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.textDisabled,
  },
  fullWidth: { width: '100%' },
});
