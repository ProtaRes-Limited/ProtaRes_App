import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize } from '@/config/theme';

interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  disabled?: boolean;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  disabled = false,
}: CheckboxFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Pressable
            onPress={() => {
              if (!disabled) onChange(!value);
            }}
            style={styles.row}
            disabled={disabled}
          >
            <View
              style={[
                styles.checkbox,
                value ? styles.checkboxChecked : styles.checkboxUnchecked,
                disabled && styles.disabled,
              ]}
            >
              {value && <Check size={14} color={colors.white} />}
            </View>
            <Text style={[styles.label, disabled && styles.disabled]}>{label}</Text>
          </Pressable>
          {error?.message && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkbox: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  checkboxChecked: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  checkboxUnchecked: {
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray[700],
  },
  errorText: {
    marginTop: spacing[1],
    marginLeft: 36,
    fontSize: fontSize.sm,
    color: colors.emergency[500],
  },
});
