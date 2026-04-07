import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'success' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-white border-2 border-primary-500 active:bg-primary-50',
  emergency: 'bg-emergency-500 active:bg-emergency-600',
  success: 'bg-success-500 active:bg-success-600',
  ghost: 'bg-transparent active:bg-gray-100',
  danger: 'bg-emergency-500 active:bg-emergency-600',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-500',
  emergency: 'text-white',
  success: 'text-white',
  ghost: 'text-primary-500',
  danger: 'text-white',
};

const sizeStyles: Record<ButtonSize, { button: string; text: string; icon: number }> = {
  sm: { button: 'h-9 px-3', text: 'text-sm', icon: 16 },
  md: { button: 'h-11 px-4', text: 'text-base', icon: 20 },
  lg: { button: 'h-14 px-6', text: 'text-lg', icon: 24 },
  xl: { button: 'h-16 px-8', text: 'text-xl', icon: 28 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const iconColor = variant === 'secondary' || variant === 'ghost' ? '#005EB8' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-lg ${variantStyles[variant]} ${sizeStyles[size].button} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon && iconPosition === 'left' && <Icon size={sizeStyles[size].icon} color={iconColor} />}
          <Text className={`font-semibold ${variantTextStyles[variant]} ${sizeStyles[size].text}`}>
            {children}
          </Text>
          {Icon && iconPosition === 'right' && <Icon size={sizeStyles[size].icon} color={iconColor} />}
        </View>
      )}
    </Pressable>
  );
}
