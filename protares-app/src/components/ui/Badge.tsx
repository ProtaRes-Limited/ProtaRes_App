import { cn } from '@/lib/utils';
import type { ResponderTier } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  tier?: ResponderTier;
}

const variantStyles: Record<Exclude<BadgeVariant, 'tier'>, { bg: string; text: string }> = {
  default: { bg: 'bg-gray-100', text: 'text-gray-700' },
  success: { bg: 'bg-success-100', text: 'text-success-700' },
  warning: { bg: 'bg-warning-100', text: 'text-warning-700' },
  error: { bg: 'bg-emergency-100', text: 'text-emergency-700' },
  info: { bg: 'bg-primary-100', text: 'text-primary-700' },
};

const tierStyles: Record<ResponderTier, { bg: string; text: string }> = {
  tier1_active_healthcare: { bg: 'bg-success-100', text: 'text-success-700' },
  tier2_retired_healthcare: { bg: 'bg-purple-100', text: 'text-purple-700' },
  tier3_first_aid: { bg: 'bg-warning-100', text: 'text-warning-700' },
  tier4_witness: { bg: 'bg-primary-100', text: 'text-primary-700' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({ label, variant = 'default', size = 'md', tier }: BadgeProps) {
  const styles = variant === 'tier' && tier ? tierStyles[tier] : variantStyles[variant as Exclude<BadgeVariant, 'tier'>];

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', styles.bg, styles.text, sizeStyles[size])}>
      {label}
    </span>
  );
}

export function TierBadge({ tier }: { tier: ResponderTier }) {
  const labels: Record<ResponderTier, string> = {
    tier1_active_healthcare: 'Healthcare',
    tier2_retired_healthcare: 'Retired HC',
    tier3_first_aid: 'First Aid',
    tier4_witness: 'Witness',
  };
  return <Badge label={labels[tier]} variant="tier" tier={tier} />;
}
