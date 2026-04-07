import { Modal as RNModal, View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-lg rounded-2xl bg-white p-6"
          onPress={() => {}}
        >
          {title && (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">{title}</Text>
              <Pressable
                onPress={onClose}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-100"
              >
                <X size={20} color="#6B7280" />
              </Pressable>
            </View>
          )}

          {!title && (
            <Pressable
              onPress={onClose}
              className="absolute right-4 top-4 z-10 h-8 w-8 items-center justify-center rounded-full active:bg-gray-100"
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          )}

          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
