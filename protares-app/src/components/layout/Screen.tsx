import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

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
  bgColor = 'bg-gray-50',
}: ScreenProps) {
  const Container = safeArea ? SafeAreaView : View;
  const content = scroll ? (
    <ScrollView
      className={`flex-1 ${padded ? 'px-4' : ''}`}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-4' : ''}`}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <Container className={`flex-1 ${bgColor}`}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          {content}
        </KeyboardAvoidingView>
      </Container>
    );
  }

  return <Container className={`flex-1 ${bgColor}`}>{content}</Container>;
}
