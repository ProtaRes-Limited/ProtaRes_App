import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  message,
  fullScreen = false,
  size = 'large',
  color = '#005EB8',
}: LoadingSpinnerProps) {
  return (
    <View
      className={cn(
        'items-center justify-center',
        fullScreen ? 'flex-1 bg-gray-50' : 'py-8',
      )}
    >
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-3 text-center text-sm text-gray-500">
          {message}
        </Text>
      )}
    </View>
  );
}
