import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'success' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-white hover:bg-primary-50 text-primary-500 border-2 border-primary-500',
  emergency: 'bg-emergency-500 hover:bg-emergency-600 text-white',
  success: 'bg-success-500 hover:bg-success-600 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-primary-500',
  danger: 'bg-emergency-500 hover:bg-emergency-600 text-white',
};

const sizeStyles: Record<ButtonSize, { button: string; icon: number }> = {
  sm: { button: 'h-9 px-3 text-sm gap-1.5', icon: 16 },
  md: { button: 'h-11 px-4 text-base gap-2', icon: 20 },
  lg: { button: 'h-13 px-6 text-lg gap-2', icon: 24 },
  xl: { button: 'h-15 px-8 text-xl gap-3', icon: 28 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors cursor-pointer',
        variantStyles[variant],
        sizeStyles[size].button,
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={sizeStyles[size].icon} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={sizeStyles[size].icon} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={sizeStyles[size].icon} />}
        </>
      )}
    </button>
  );
}
