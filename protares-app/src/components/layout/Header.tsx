import { View, Text, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
}

export function Header({
  title,
  showBack = true,
  onBackPress,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-gray-200 bg-white px-4">
      <View className="w-10">
        {showBack && (
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronLeft size={24} color="#111827" />
          </Pressable>
        )}
      </View>

      <Text className="flex-1 text-center text-lg font-bold text-gray-900" numberOfLines={1}>
        {title}
      </Text>

      <View className="w-10 items-end">
        {rightAction}
      </View>
    </View>
  );
}
