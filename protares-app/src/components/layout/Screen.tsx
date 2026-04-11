import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/config/theme';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  withKeyboardAvoid?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Consistent screen wrapper. Provides safe-area insets, optional
 * scrolling, and keyboard avoidance for auth and form screens.
 */
export function Screen({
  children,
  scrollable = false,
  withKeyboardAvoid = false,
  padded = true,
  style,
  edges = ['top', 'left', 'right'],
}: Props) {
  const inner = (
    <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
  );

  const body = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  ) : (
    inner
  );

  const avoidWrapped = withKeyboardAvoid ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {avoidWrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
});
