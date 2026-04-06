import { useEffect, useState } from 'react';
import { BadgeCheck, Shield } from 'lucide-react';
import { TierBadge } from '@/components/ui/Badge';
import type { GreenBadge } from '@/types';

interface GreenBadgeDisplayProps {
  badge: GreenBadge;
  onRefresh: () => void;
}

export function GreenBadgeDisplay({ badge, onRefresh }: GreenBadgeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      const expires = new Date(badge.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        onRefresh();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [badge.expiresAt, onRefresh]);

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-lg">
      <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center mb-4">
        <BadgeCheck size={48} className="text-white" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">{badge.name}</h2>
      <TierBadge tier={badge.tier} />

      {/* QR Code placeholder - would use a QR library in production */}
      <div className="my-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Shield size={48} className="text-primary-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">QR Code</p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono break-all max-w-[160px]">
              {badge.qrData.substring(0, 32)}...
            </p>
          </div>
        </div>
      </div>

      <div className="w-full text-center">
        <p className="text-gray-600 mb-2">Valid for: {timeLeft} seconds</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-success-500 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-gray-500 text-center mt-4 text-sm">
        Show this to emergency services to verify your credentials
      </p>
    </div>
  );
}
