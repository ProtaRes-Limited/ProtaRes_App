import { useEffect, useRef } from 'react';
import { Text, Pressable, Animated, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/config/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const toastColors: Record<ToastType, string> = {
  success: colors.success[500],
  error: colors.emergency[500],
  info: colors.primary[500],
  warning: colors.warning[500],
};

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Toast({ visible, type = 'info', message, duration = 3000, onDismiss }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const bgColor = toastColors[type];
  const Icon = toastIcons[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
    >
      <Icon size={20} color={colors.white} />
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={handleDismiss} style={styles.closeButton}>
        <X size={18} color={colors.white} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    top: spacing[12],
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...shadows.lg,
  },
  message: {
    marginLeft: spacing[3],
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  closeButton: {
    marginLeft: spacing[2],
  },
});
