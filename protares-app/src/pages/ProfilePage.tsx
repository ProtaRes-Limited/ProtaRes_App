import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Settings, Bell, Lock, Download, LogOut, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';

interface MenuItemProps {
  icon: typeof Shield;
  label: string;
  description?: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, description, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-emergency-50' : 'bg-primary-50'}`}>
        <Icon size={20} className={danger ? 'text-emergency-500' : 'text-primary-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${danger ? 'text-emergency-600' : 'text-gray-900'}`}>{label}</p>
        {description && <p className="text-gray-500 text-sm truncate">{description}</p>}
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch {
      // Continue with local logout even if server logout fails
    }
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-white p-6 text-center border-b border-gray-200">
        <Avatar name={user?.fullName} src={user?.profilePhotoUrl} size="xl" />
        <h2 className="text-xl font-bold text-gray-900 mt-3">{user?.fullName || 'Responder'}</h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>
        {user?.tier && <div className="mt-2 flex justify-center"><TierBadge tier={user.tier} /></div>}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-1">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-3">Credentials</p>
        <MenuItem icon={CreditCard} label="Green Badge" description="Show your verified credentials" onClick={() => navigate('/app/profile/green-badge')} />
        <MenuItem icon={Shield} label="Verify Credentials" description="GMC, NMC, or First Aid" onClick={() => navigate('/app/profile/credentials')} />
      </div>

      <div className="p-4 space-y-1">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-3">Settings</p>
        <MenuItem icon={Bell} label="Notifications" description="Alert preferences" onClick={() => navigate('/app/settings/notifications')} />
        <MenuItem icon={Lock} label="Privacy" description="Location, data, consent" onClick={() => navigate('/app/settings/privacy')} />
        <MenuItem icon={Settings} label="General Settings" description="App preferences" onClick={() => navigate('/app/settings')} />
        <MenuItem icon={Download} label="Download My Data" description="GDPR data export" onClick={() => navigate('/app/settings/data-export')} />
      </div>

      <div className="p-4">
        <MenuItem icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
      </div>

      <div className="p-4 text-center text-gray-400 text-xs">
        ProtaRes v1.0.0
      </div>
    </div>
  );
}
