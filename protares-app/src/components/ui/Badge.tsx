import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.gray[100], text: colors.gray[700] },
  success: { bg: colors.success[100], text: colors.success[700] },
  warning: { bg: colors.warning[100], text: colors.warning[700] },
  error: { bg: colors.emergency[100], text: colors.emergency[700] },
  info: { bg: colors.primary[100], text: colors.primary[700] },
  tier: { bg: colors.primary[100], text: colors.primary[700] },
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const c = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{children}</Text>
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

const tierPalette: Record<TierLevel, { bg: string; text: string }> = {
  1: { bg: colors.emergency[100], text: colors.emergency[700] },
  2: { bg: colors.primary[100], text: colors.primary[700] },
  3: { bg: colors.success[100], text: colors.success[700] },
  4: { bg: colors.gray[100], text: colors.gray[700] },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const c = tierPalette[tier];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.tierText, { color: c.text }]}>{tierLabels[tier]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  tierText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
