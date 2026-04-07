import { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { cn } from '@/lib/utils';

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
  const isPassword = secureTextEntry;
  const isSecure = isPassword && !showPassword;

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
        </Text>
      )}

      <View className="relative">
        <TextInput
          className={cn(
            'rounded-lg border bg-white px-4 py-3 text-base text-gray-900',
            error ? 'border-emergency-500' : 'border-gray-300',
            disabled && 'bg-gray-100 opacity-60',
            multiline && 'min-h-[100px] py-3',
            isPassword && 'pr-12',
          )}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-0 bottom-0 items-center justify-center"
          >
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </Pressable>
        )}
      </View>

      {error && (
        <Text className="mt-1 text-sm text-emergency-500">{error}</Text>
      )}

      {helperText && !error && (
        <Text className="mt-1 text-sm text-gray-500">{helperText}</Text>
      )}
    </View>
  );
}
