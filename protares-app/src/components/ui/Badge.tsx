import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantBgStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100',
  success: 'bg-success-100',
  warning: 'bg-yellow-100',
  error: 'bg-emergency-100',
  info: 'bg-blue-100',
  tier: 'bg-primary-100',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-gray-700',
  success: 'text-success-700',
  warning: 'text-yellow-700',
  error: 'text-emergency-700',
  info: 'text-blue-700',
  tier: 'text-primary-700',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <View className={cn('self-start rounded-full px-3 py-1', variantBgStyles[variant])}>
      <Text className={cn('text-xs font-semibold', variantTextStyles[variant])}>
        {children}
      </Text>
    </View>
  );
}

type TierLevel = 1 | 2 | 3 | 4;

interface TierBadgeProps {
  tier: TierLevel;
}

const tierLabels: Record<TierLevel, string> = {
  1: 'Tier 1 — Emergency First Responder',
  2: 'Tier 2 — Enhanced Responder',
  3: 'Tier 3 — Community First Aider',
  4: 'Tier 4 — Aware Citizen',
};

const tierColors: Record<TierLevel, { bg: string; text: string }> = {
  1: { bg: 'bg-emergency-100', text: 'text-emergency-700' },
  2: { bg: 'bg-primary-100', text: 'text-primary-700' },
  3: { bg: 'bg-success-100', text: 'text-success-700' },
  4: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const colors = tierColors[tier];

  return (
    <View className={cn('self-start rounded-full px-3 py-1', colors.bg)}>
      <Text className={cn('text-xs font-bold', colors.text)}>
        {tierLabels[tier]}
      </Text>
    </View>
  );
}
