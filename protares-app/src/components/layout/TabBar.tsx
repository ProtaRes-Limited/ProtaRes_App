import { NavLink } from 'react-router-dom';
import { Home, Bell, Map, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmergencyStore } from '@/stores/emergency';

const tabs = [
  { path: '/app', icon: Home, label: 'Home', end: true },
  { path: '/app/alerts', icon: Bell, label: 'Alerts', end: false },
  { path: '/app/map', icon: Map, label: 'Map', end: false },
  { path: '/app/history', icon: Clock, label: 'History', end: false },
  { path: '/app/profile', icon: User, label: 'Profile', end: false },
] as const;

export function TabBar() {
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);

  return (
    <nav className="flex items-center justify-around h-16 bg-white border-t border-gray-200 flex-shrink-0">
      {tabs.map(({ path, icon: Icon, label, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[64px] transition-colors',
              isActive ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {label === 'Alerts' && pendingAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emergency-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingAlerts.length}
                  </span>
                )}
              </div>
              <span className={cn('text-xs', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
