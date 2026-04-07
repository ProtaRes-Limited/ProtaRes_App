import { Controller, useFormContext } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { KeyboardTypeOptions } from 'react-native';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  helperText?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  disabled,
  multiline,
  numberOfLines,
  helperText,
}: FormFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          value={value as string}
          onChangeText={onChange}
          error={error?.message}
          helperText={helperText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      )}
    />
  );
}
