import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Clock, CheckCircle, AlertTriangle, CreditCard, Radio } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import type { AvailabilityStatus } from '@/types';

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'bg-success-500', bg: 'bg-success-50' },
  busy: { label: 'Responding', color: 'bg-warning-500', bg: 'bg-warning-50' },
  unavailable: { label: 'Off Duty', color: 'bg-gray-400', bg: 'bg-gray-50' },
  do_not_disturb: { label: 'Do Not Disturb', color: 'bg-emergency-500', bg: 'bg-emergency-50' },
};

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const status = user?.availability || 'unavailable';
  const config = statusConfig[status];

  const toggleAvailability = async () => {
    setToggling(true);
    const newStatus: AvailabilityStatus = status === 'available' ? 'unavailable' : 'available';
    updateUser({ availability: newStatus });
    setToggling(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {user?.firstName || 'Responder'}
          </h1>
          <p className="text-gray-500 text-sm">Welcome to ProtaRes</p>
        </div>
        <Avatar name={user?.fullName} src={user?.profilePhotoUrl} size="lg" showOnlineStatus isOnline={status === 'available'} />
      </div>

      {/* Status Card */}
      <Card className={cn('border-2', config.bg)} onClick={toggleAvailability} clickable>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-4 h-4 rounded-full', config.color)} />
            <div>
              <p className="font-semibold text-gray-900">Status: {config.label}</p>
              <p className="text-gray-500 text-sm">
                {status === 'available' ? 'You will receive emergency alerts' : 'Tap to go available'}
              </p>
            </div>
          </div>
          <Button variant={status === 'available' ? 'secondary' : 'success'} size="sm" loading={toggling}>
            {status === 'available' ? 'Go Off Duty' : 'Go Available'}
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="outlined" className="text-center p-3">
          <Activity size={20} className="text-primary-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{user?.totalResponses || 0}</p>
          <p className="text-gray-500 text-xs">Total Alerts</p>
        </Card>
        <Card variant="outlined" className="text-center p-3">
          <CheckCircle size={20} className="text-success-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{user?.totalAccepted || 0}</p>
          <p className="text-gray-500 text-xs">Accepted</p>
        </Card>
        <Card variant="outlined" className="text-center p-3">
          <Clock size={20} className="text-warning-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {user?.averageResponseTimeSeconds ? `${Math.round(user.averageResponseTimeSeconds / 60)}m` : '--'}
          </p>
          <p className="text-gray-500 text-xs">Avg Time</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <Button variant="emergency" fullWidth size="lg" icon={AlertTriangle} onClick={() => navigate('/app/report')}>
            Report Emergency
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" fullWidth icon={CreditCard} onClick={() => navigate('/app/profile/green-badge')}>
              Green Badge
            </Button>
            <Button variant="secondary" fullWidth icon={Radio} onClick={() => navigate('/app/alerts')}>
              View Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* Tier Badge */}
      {user?.tier && (
        <Card variant="outlined">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">Your Credentials</p>
                <p className="text-gray-500 text-sm">Tier status and verification</p>
              </div>
            </div>
            <Badge label={user.tier.replace('tier1_', '').replace('tier2_', '').replace('tier3_', '').replace('tier4_', '').replace(/_/g, ' ')} variant="info" />
          </div>
        </Card>
      )}
    </div>
  );
}
