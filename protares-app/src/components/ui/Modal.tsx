import { Modal as RNModal, View, Text, Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { X } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <X size={20} color={colors.gray[500]} />
              </Pressable>
            </View>
          )}
          {!title && (
            <Pressable style={[styles.closeButton, styles.absoluteClose]} onPress={onClose}>
              <X size={20} color={colors.gray[500]} />
            </Pressable>
          )}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing[6],
  },
  content: {
    width: '100%',
    maxWidth: 500,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    padding: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  absoluteClose: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 10,
  },
});
