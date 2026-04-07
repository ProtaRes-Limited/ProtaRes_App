import { useEffect, useRef } from 'react';
import { Text, Pressable, Animated } from 'react-native';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const toastStyles: Record<ToastType, { bg: string; text: string; color: string }> = {
  success: { bg: 'bg-success-500', text: 'text-white', color: '#FFFFFF' },
  error: { bg: 'bg-emergency-500', text: 'text-white', color: '#FFFFFF' },
  info: { bg: 'bg-blue-500', text: 'text-white', color: '#FFFFFF' },
  warning: { bg: 'bg-yellow-500', text: 'text-white', color: '#FFFFFF' },
};

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Toast({
  visible,
  type = 'info',
  message,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const style = toastStyles[type];
  const Icon = toastIcons[type];

  return (
    <Animated.View
      className={cn(
        'absolute left-4 right-4 top-12 z-50 flex-row items-center rounded-xl px-4 py-3 shadow-lg',
        style.bg,
      )}
      style={{ transform: [{ translateY }], opacity }}
    >
      <Icon size={20} color={style.color} />
      <Text className={cn('ml-3 flex-1 text-sm font-medium', style.text)}>
        {message}
      </Text>
      <Pressable onPress={handleDismiss} className="ml-2">
        <X size={18} color={style.color} />
      </Pressable>
    </Animated.View>
  );
}
