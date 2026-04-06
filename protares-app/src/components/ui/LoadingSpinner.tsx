import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 32, message, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 size={size} className="animate-spin text-primary-500" />
      {message && <p className="text-gray-600 mt-2 text-center">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-white">{content}</div>;
  }
  return content;
}
