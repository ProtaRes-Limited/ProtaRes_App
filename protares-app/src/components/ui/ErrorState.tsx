import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 flex-1">
      <div className="w-16 h-16 rounded-full bg-emergency-100 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-emergency-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{title}</h3>
      <p className="text-gray-500 text-center mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" icon={RefreshCw}>Try Again</Button>
      )}
    </div>
  );
}
