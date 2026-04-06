import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { GreenBadgeDisplay } from '@/components/credentials/GreenBadgeDisplay';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
import type { GreenBadge } from '@/types';

function generateBadgeData(user: { id: string; fullName: string; tier: string }): GreenBadge {
  const now = new Date();
  const expires = new Date(now.getTime() + 60000);
  const nonce = Math.random().toString(36).substring(2, 18);

  return {
    responderId: user.id,
    name: user.fullName,
    tier: user.tier as GreenBadge['tier'],
    credentialType: 'gmc',
    verified: true,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    qrData: JSON.stringify({
      id: user.id,
      t: user.tier,
      n: nonce,
      exp: expires.getTime(),
    }),
  };
}

export function GreenBadgePage() {
  const user = useAuthStore((s) => s.user);
  const [badge, setBadge] = useState<GreenBadge | null>(
    user ? generateBadgeData({ id: user.id, fullName: user.fullName, tier: user.tier }) : null
  );

  const handleRefresh = useCallback(() => {
    if (user) {
      setBadge(generateBadgeData({ id: user.id, fullName: user.fullName, tier: user.tier }));
    }
  }, [user]);

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Green Badge" showBack />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {badge ? (
          <GreenBadgeDisplay badge={badge} onRefresh={handleRefresh} />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Unable to generate badge. Please verify your credentials first.</p>
            <Button variant="primary">Verify Credentials</Button>
          </div>
        )}
      </div>
    </div>
  );
}
