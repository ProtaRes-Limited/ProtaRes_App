import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {Icon && (
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Icon size={32} color="#9CA3AF" />
        </View>
      )}

      <Text className="mb-2 text-center text-lg font-semibold text-gray-900">
        {title}
      </Text>

      {description && (
        <Text className="mb-6 text-center text-sm text-gray-500">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
