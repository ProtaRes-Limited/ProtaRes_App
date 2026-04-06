import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  isPassword = false,
  className,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-medium mb-1.5 text-sm">{label}</label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            'w-full h-12 px-4 rounded-lg border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error ? 'border-emergency-500 focus:ring-emergency-500' : 'border-gray-300',
            props.disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            (isPassword || error) && 'pr-12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        {error && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle size={20} className="text-emergency-500" />
          </div>
        )}
      </div>
      {error && <p className="text-emergency-500 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
