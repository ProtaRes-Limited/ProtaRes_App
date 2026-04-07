import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import {
  ShieldCheck,
  RefreshCw,
  Clock,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge, TierBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth';
import { TIER_LABELS, TIER_COLORS } from '@/lib/constants';
import type { GreenBadge } from '@/types';

export default function GreenBadgeScreen() {
  const user = useAuthStore((s) => s.user);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const tierNumber = user?.tier === 'tier1_active_healthcare'
    ? 1
    : user?.tier === 'tier2_retired_healthcare'
    ? 2
    : user?.tier === 'tier3_first_aid'
    ? 3
    : 4;

  const tierColor = user?.tier ? TIER_COLORS[user.tier] : '#005EB8';

  // Mock badge data
  const mockBadge: GreenBadge = {
    responderId: user?.id || 'unknown',
    name: user?.fullName || 'Responder',
    tier: user?.tier || 'tier4_witness',
    credentialType: 'GMC',
    verified: true,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 1000).toISOString(),
    qrData: `protares://verify/${user?.id || 'unknown'}/${Date.now()}`,
  };

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Reset — in real app, would regenerate QR
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Screen safeArea padded={false}>
      <Header title="Green Badge" />
      <View className="flex-1 px-4 items-center">
        {/* Badge Card */}
        <Card variant="elevated" className="mt-6 w-full">
          {/* Badge Header */}
          <View className="items-center pb-4 border-b border-gray-100 mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${tierColor}20` }}
            >
              <ShieldCheck size={36} color={tierColor} />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {mockBadge.name}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Verified Emergency Responder
            </Text>
            <View className="mt-2">
              <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
            </View>
          </View>

          {/* QR Code Placeholder */}
          <View className="items-center py-6">
            <View className="w-52 h-52 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300">
              <View className="items-center">
                <ShieldCheck size={48} color={tierColor} />
                <Text className="text-xs text-gray-400 mt-2 text-center">
                  QR Code
                </Text>
                <Text className="text-[10px] text-gray-300 mt-1 text-center px-4">
                  Scan to verify responder credentials
                </Text>
              </View>
            </View>
          </View>

          {/* Auto-refresh Timer */}
          <View className="flex-row items-center justify-center gap-2 pb-2">
            <RefreshCw size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500">
              Auto-refreshes in{' '}
              <Text className="font-semibold">{refreshCountdown}s</Text>
            </Text>
          </View>
        </Card>

        {/* Badge Details */}
        <Card variant="outlined" className="mt-4 w-full">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">Status</Text>
              <Badge variant={mockBadge.verified ? 'success' : 'warning'}>
                {mockBadge.verified ? 'Verified' : 'Pending'}
              </Badge>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">Tier</Text>
              <Text className="text-sm font-medium text-gray-900">
                {user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}
              </Text>
            </View>

            {mockBadge.credentialType && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Credential</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {mockBadge.credentialType} Registered
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">Responder ID</Text>
              <Text className="text-sm font-mono text-gray-600">
                {mockBadge.responderId.slice(0, 12)}...
              </Text>
            </View>
          </View>
        </Card>

        {/* Instructions */}
        <View className="mt-4 px-4 mb-8">
          <Text className="text-xs text-gray-400 text-center">
            Show this badge to emergency services or bystanders to verify your
            credentials. The QR code refreshes automatically for security.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
