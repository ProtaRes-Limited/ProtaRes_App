import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  dismissable?: boolean;
}

export function Modal({ open, onClose, title, children, showCloseButton = true, dismissable = true }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={dismissable ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
