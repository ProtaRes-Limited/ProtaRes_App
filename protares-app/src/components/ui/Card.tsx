import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'emergency' | 'active';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  clickable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white shadow-md',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border border-gray-200',
  emergency: 'bg-emergency-50 border-2 border-emergency-500 shadow-lg',
  active: 'bg-primary-50 border-2 border-primary-500',
};

export function Card({ children, variant = 'default', clickable, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4',
        variantStyles[variant],
        clickable && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
