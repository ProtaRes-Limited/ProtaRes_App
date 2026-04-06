import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  isPassword?: boolean;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  isPassword,
  type,
  autoComplete,
  disabled,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          error={error?.message}
          isPassword={isPassword}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      )}
    />
  );
}
