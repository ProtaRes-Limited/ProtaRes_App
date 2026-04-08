import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';
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
      <View style={styles.container}>
        {/* Badge Card */}
        <Card variant="elevated" style={styles.badgeCard}>
          {/* Badge Header */}
          <View style={styles.badgeHeader}>
            <View
              style={[
                styles.badgeIconCircle,
                { backgroundColor: `${tierColor}20` },
              ]}
            >
              <ShieldCheck size={36} color={tierColor} />
            </View>
            <Text style={styles.badgeName}>
              {mockBadge.name}
            </Text>
            <Text style={styles.badgeSubtitle}>
              Verified Emergency Responder
            </Text>
            <View style={styles.tierBadgeWrapper}>
              <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
            </View>
          </View>

          {/* QR Code Placeholder */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrBox}>
              <View style={styles.qrInner}>
                <ShieldCheck size={48} color={tierColor} />
                <Text style={styles.qrTitle}>
                  QR Code
                </Text>
                <Text style={styles.qrSubtitle}>
                  Scan to verify responder credentials
                </Text>
              </View>
            </View>
          </View>

          {/* Auto-refresh Timer */}
          <View style={styles.refreshRow}>
            <RefreshCw size={14} color="#9CA3AF" />
            <Text style={styles.refreshText}>
              Auto-refreshes in{' '}
              <Text style={styles.refreshCount}>{refreshCountdown}s</Text>
            </Text>
          </View>
        </Card>

        {/* Badge Details */}
        <Card variant="outlined" style={styles.detailsCard}>
          <View style={styles.detailsList}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Status</Text>
              <Badge variant={mockBadge.verified ? 'success' : 'warning'}>
                {mockBadge.verified ? 'Verified' : 'Pending'}
              </Badge>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Tier</Text>
              <Text style={styles.detailsValue}>
                {user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}
              </Text>
            </View>

            {mockBadge.credentialType && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Credential</Text>
                <Text style={styles.detailsValue}>
                  {mockBadge.credentialType} Registered
                </Text>
              </View>
            )}

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Responder ID</Text>
              <Text style={styles.detailsMono}>
                {mockBadge.responderId.slice(0, 12)}...
              </Text>
            </View>
          </View>
        </Card>

        {/* Instructions */}
        <View style={styles.instructionsWrapper}>
          <Text style={styles.instructionsText}>
            Show this badge to emergency services or bystanders to verify your
            credentials. The QR code refreshes automatically for security.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  badgeCard: {
    marginTop: spacing[6],
    width: '100%',
  },
  badgeHeader: {
    alignItems: 'center',
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: spacing[4],
  },
  badgeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  badgeName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  badgeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  tierBadgeWrapper: {
    marginTop: spacing[2],
  },
  qrWrapper: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  qrBox: {
    width: 208,
    height: 208,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
  },
  qrInner: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 10,
    color: colors.gray[300],
    marginTop: spacing[1],
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingBottom: spacing[2],
  },
  refreshText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  refreshCount: {
    fontWeight: fontWeight.semibold,
  },
  detailsCard: {
    marginTop: spacing[4],
    width: '100%',
  },
  detailsList: {
    gap: spacing[3],
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  detailsValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  detailsMono: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    color: colors.gray[600],
  },
  instructionsWrapper: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[8],
  },
  instructionsText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    textAlign: 'center',
  },
});
