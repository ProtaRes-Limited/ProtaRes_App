import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; icon: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm', icon: 16 },
  md: { container: 'w-10 h-10', text: 'text-base', icon: 20 },
  lg: { container: 'w-14 h-14', text: 'text-xl', icon: 28 },
  xl: { container: 'w-20 h-20', text: 'text-2xl', icon: 40 },
};

export function Avatar({ src, name, size = 'md', showOnlineStatus = false, isOnline = false }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative inline-flex">
      <div
        className={cn(
          sizeStyles[size].container,
          'rounded-full overflow-hidden bg-primary-100 flex items-center justify-center'
        )}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : initials ? (
          <span className={cn(sizeStyles[size].text, 'font-semibold text-primary-600')}>{initials}</span>
        ) : (
          <User size={sizeStyles[size].icon} className="text-primary-500" />
        )}
      </div>
      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            isOnline ? 'bg-success-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
