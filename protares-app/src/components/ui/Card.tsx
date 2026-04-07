import { View, Pressable } from 'react-native';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'emergency' | 'active';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white rounded-xl p-4',
  elevated: 'bg-white rounded-xl p-4 shadow-md',
  outlined: 'bg-white rounded-xl p-4 border border-gray-200',
  emergency: 'bg-emergency-50 rounded-xl p-4 border-2 border-emergency-500',
  active: 'bg-primary-50 rounded-xl p-4 border-2 border-primary-500',
};

export function Card({
  children,
  variant = 'default',
  onPress,
  className: extraClassName,
}: CardProps) {
  const styles = cn(variantStyles[variant], extraClassName);

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(styles, 'active:opacity-90')}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={styles}>{children}</View>;
}
