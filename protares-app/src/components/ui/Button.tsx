import { Pressable, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'success' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantColors: Record<
  ButtonVariant,
  { bg: string; pressedBg: string; text: string; border?: string }
> = {
  primary: { bg: colors.primary[500], pressedBg: colors.primary[600], text: colors.white },
  secondary: {
    bg: colors.white,
    pressedBg: colors.primary[50],
    text: colors.primary[500],
    border: colors.primary[500],
  },
  emergency: { bg: colors.emergency[500], pressedBg: colors.emergency[600], text: colors.white },
  success: { bg: colors.success[500], pressedBg: colors.success[600], text: colors.white },
  ghost: { bg: 'transparent', pressedBg: colors.gray[100], text: colors.primary[500] },
  danger: { bg: colors.emergency[500], pressedBg: colors.emergency[600], text: colors.white },
};

const sizeDims: Record<
  ButtonSize,
  { height: number; px: number; fontSize: number; iconSize: number }
> = {
  sm: { height: 36, px: spacing[3], fontSize: fontSize.sm, iconSize: 16 },
  md: { height: 44, px: spacing[4], fontSize: fontSize.base, iconSize: 20 },
  lg: { height: 56, px: spacing[6], fontSize: fontSize.lg, iconSize: 24 },
  xl: { height: 64, px: spacing[8], fontSize: fontSize.xl, iconSize: 28 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantColors[variant];
  const s = sizeDims[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? v.pressedBg : v.bg,
          height: s.height,
          paddingHorizontal: s.px,
          borderWidth: v.border ? 2 : 0,
          borderColor: v.border,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === 'left' && <Icon size={s.iconSize} color={v.text} />}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{children}</Text>
          {Icon && iconPosition === 'right' && <Icon size={s.iconSize} color={v.text} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
});
