import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  duration?: number;
  onHide: () => void;
}

const config: Record<ToastType, { bg: string; Icon: typeof CheckCircle }> = {
  success: { bg: 'bg-success-500', Icon: CheckCircle },
  error: { bg: 'bg-emergency-500', Icon: AlertCircle },
  info: { bg: 'bg-primary-500', Icon: Info },
  warning: { bg: 'bg-warning-500', Icon: AlertCircle },
};

export function Toast({ visible, type, message, duration = 3000, onHide }: ToastProps) {
  const [show, setShow] = useState(false);
  const { bg, Icon } = config[type];

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50',
        bg, 'rounded-lg p-4 flex items-center shadow-lg transition-opacity duration-200',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      <Icon size={24} className="text-white flex-shrink-0" />
      <p className="flex-1 text-white font-medium ml-3">{message}</p>
      <button onClick={() => { setShow(false); setTimeout(onHide, 200); }} className="ml-2">
        <X size={18} className="text-white/80 hover:text-white" />
      </button>
    </div>
  );
}
