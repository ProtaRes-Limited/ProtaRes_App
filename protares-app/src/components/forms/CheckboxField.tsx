import { View, Text, Pressable } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

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
        <View className="mb-4">
          <Pressable
            onPress={() => {
              if (!disabled) onChange(!value);
            }}
            className="flex-row items-center gap-3"
            disabled={disabled}
          >
            <View
              className={cn(
                'h-6 w-6 items-center justify-center rounded border-2',
                value
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 bg-white',
                disabled && 'opacity-50',
              )}
            >
              {value && <Check size={14} color="#FFFFFF" />}
            </View>

            <Text
              className={cn(
                'flex-1 text-sm text-gray-700',
                disabled && 'opacity-50',
              )}
            >
              {label}
            </Text>
          </Pressable>

          {error?.message && (
            <Text className="mt-1 ml-9 text-sm text-emergency-500">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
