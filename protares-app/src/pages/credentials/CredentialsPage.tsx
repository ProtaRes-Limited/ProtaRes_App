import { useNavigate } from 'react-router-dom';
import { Shield, Stethoscope, Heart, Award, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth';
import { TIER_LABELS } from '@/lib/constants';

export function CredentialsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Credentials" showBack />

      <div className="p-4 space-y-4">
        {/* Current Tier */}
        <Card variant="active">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Current Tier</p>
              <p className="text-primary-600 text-sm">{user?.tier ? TIER_LABELS[user.tier] : 'Not set'}</p>
            </div>
          </div>
        </Card>

        {/* Verification Options */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">Verify Your Credentials</h2>

        <Card variant="outlined" clickable onClick={() => navigate('/app/profile/credentials/verify-gmc')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center">
                <Stethoscope size={20} className="text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Doctor (GMC)</p>
                <p className="text-gray-500 text-sm">Verify with GMC number</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Tier 1" variant="success" size="sm" />
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </Card>

        <Card variant="outlined" clickable onClick={() => navigate('/app/profile/credentials/verify-nmc')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Heart size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nurse / Midwife (NMC)</p>
                <p className="text-gray-500 text-sm">Verify with NMC PIN</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Tier 1" variant="success" size="sm" />
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </Card>

        <Card variant="outlined" clickable onClick={() => navigate('/app/profile/credentials/verify-first-aid')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center">
                <Award size={20} className="text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">First Aid Certificate</p>
                <p className="text-gray-500 text-sm">Upload your certificate</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge label="Tier 3" variant="warning" size="sm" />
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
