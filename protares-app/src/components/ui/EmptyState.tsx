import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 flex-1">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-center mb-6 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">{actionLabel}</Button>
      )}
    </div>
  );
}
