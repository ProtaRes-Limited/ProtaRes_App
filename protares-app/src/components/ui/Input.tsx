import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, radii, spacing, touchTargets, typography } from '@/config/theme';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

/**
 * Input field with visible label + error state.
 *
 * NHS guidance: never rely on placeholder text alone as a label. Every
 * input has a persistent label for screen readers and for users who
 * have autofill wipe the placeholder mid-interaction.
 */
export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, required, leftAdornment, rightAdornment, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View
        style={[
          styles.fieldContainer,
          focused && styles.fieldContainerFocused,
          !!error && styles.fieldContainerError,
        ]}
      >
        {leftAdornment ? <View style={styles.adornment}>{leftAdornment}</View> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.grey3}
          {...rest}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityState={{ disabled: rest.editable === false }}
        />
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: { color: colors.emergencyRed },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTargets.recommended,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  fieldContainerFocused: {
    borderColor: colors.nhsBlue,
  },
  fieldContainerError: {
    borderColor: colors.emergencyRed,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  adornment: {
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.emergencyRed,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
