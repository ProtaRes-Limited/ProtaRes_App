import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { colors, spacing } from '@/config/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  bgColor?: string;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  safeArea = true,
  keyboardAvoiding = false,
  bgColor = colors.gray[50],
}: ScreenProps) {
  const Container = safeArea ? SafeAreaView : View;
  const contentStyle = [styles.flex1, padded && styles.padded];

  const content = scroll ? (
    <ScrollView
      style={contentStyle}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <Container style={[styles.flex1, { backgroundColor: bgColor }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex1}
        >
          {content}
        </KeyboardAvoidingView>
      </Container>
    );
  }

  return <Container style={[styles.flex1, { backgroundColor: bgColor }]}>{content}</Container>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing[4],
  },
  scrollContent: {
    flexGrow: 1,
  },
});
