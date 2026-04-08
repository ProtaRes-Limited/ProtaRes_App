import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/config/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'large', message, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary[500]} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }
  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  message: {
    color: colors.gray[600],
    marginTop: spacing[2],
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
