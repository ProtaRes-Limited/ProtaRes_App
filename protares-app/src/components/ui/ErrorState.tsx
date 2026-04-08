import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/config/theme';

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
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <AlertTriangle size={32} color={colors.emergency[600]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button variant="primary" onPress={onRetry}>
          Try Again
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
    backgroundColor: colors.emergency[100],
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  message: {
    marginBottom: spacing[6],
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
});
