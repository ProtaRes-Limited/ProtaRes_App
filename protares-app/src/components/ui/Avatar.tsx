import { View, Image, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; icon: number; dot: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', icon: 16, dot: 'h-2.5 w-2.5' },
  md: { container: 'h-10 w-10', text: 'text-sm', icon: 20, dot: 'h-3 w-3' },
  lg: { container: 'h-14 w-14', text: 'text-lg', icon: 28, dot: 'h-3.5 w-3.5' },
  xl: { container: 'h-20 w-20', text: 'text-2xl', icon: 36, dot: 'h-4 w-4' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ source, name, size = 'md', online }: AvatarProps) {
  const s = sizeStyles[size];

  return (
    <View className="relative">
      {source ? (
        <Image
          source={{ uri: source }}
          className={cn('rounded-full', s.container)}
        />
      ) : name ? (
        <View
          className={cn(
            'items-center justify-center rounded-full bg-primary-100',
            s.container,
          )}
        >
          <Text className={cn('font-semibold text-primary-700', s.text)}>
            {getInitials(name)}
          </Text>
        </View>
      ) : (
        <View
          className={cn(
            'items-center justify-center rounded-full bg-gray-200',
            s.container,
          )}
        >
          <User size={s.icon} color="#6B7280" />
        </View>
      )}

      {online !== undefined && (
        <View
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            s.dot,
            online ? 'bg-success-500' : 'bg-gray-400',
          )}
        />
      )}
    </View>
  );
}
