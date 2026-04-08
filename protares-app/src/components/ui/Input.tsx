import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = secureTextEntry;
  const isSecure = isPassword && !showPassword;

  const borderColor = error
    ? colors.emergency[500]
    : isFocused
      ? colors.primary[500]
      : colors.gray[300];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            { borderColor, borderWidth: isFocused || error ? 2 : 1 },
            disabled && styles.disabled,
            multiline && styles.multiline,
            isPassword && styles.paddingRight,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <Pressable style={styles.eyeButton} onPress={() => setShowPassword((prev) => !prev)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.gray[500]} />
            ) : (
              <Eye size={20} color={colors.gray[500]} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[1.5],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSize.base,
    color: colors.gray[900],
    minHeight: 48,
  },
  paddingRight: {
    paddingRight: 48,
  },
  disabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  multiline: {
    minHeight: 100,
    paddingTop: spacing[3],
  },
  eyeButton: {
    position: 'absolute',
    right: spacing[3],
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: spacing[1],
    fontSize: fontSize.sm,
    color: colors.emergency[500],
  },
  helperText: {
    marginTop: spacing[1],
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
});
