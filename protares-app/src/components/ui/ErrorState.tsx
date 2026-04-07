import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-emergency-100">
        <AlertTriangle size={32} color="#DC2626" />
      </View>

      <Text className="mb-2 text-center text-lg font-semibold text-gray-900">
        {title}
      </Text>

      <Text className="mb-6 text-center text-sm text-gray-500">
        {message}
      </Text>

      {onRetry && (
        <Button variant="primary" onPress={onRetry}>
          Try Again
        </Button>
      )}
    </View>
  );
}
