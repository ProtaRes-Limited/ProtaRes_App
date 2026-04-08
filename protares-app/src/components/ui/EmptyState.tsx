import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/config/theme';

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
    <View style={styles.container}>
      {Icon && (
        <View style={styles.iconWrapper}>
          <Icon size={32} color={colors.gray[400]} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  iconWrapper: {
    marginBottom: spacing[4],
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  description: {
    marginBottom: spacing[6],
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
});
