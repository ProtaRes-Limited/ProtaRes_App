import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Activity,
  AlertTriangle,
  CreditCard,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { EmergencyAlertCard } from '@/components/emergency/EmergencyAlertCard';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import { TIER_LABELS, EMERGENCY_TYPE_LABELS } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const removePendingAlert = useEmergencyStore((s) => s.removePendingAlert);
  const [isAvailable, setIsAvailable] = useState(user?.availability === 'available');

  const firstName = user?.firstName || 'Responder';
  const tierNumber =
    user?.tier === 'tier1_active_healthcare'
      ? 1
      : user?.tier === 'tier2_retired_healthcare'
        ? 2
        : user?.tier === 'tier3_first_aid'
          ? 3
          : 4;

  const avgResponseTime = user?.averageResponseTimeSeconds
    ? `${Math.round(user.averageResponseTimeSeconds / 60)}m`
    : '--';

  const handleAcceptAlert = (id: string) => {
    removePendingAlert(id);
    router.push(`/emergency/${id}`);
  };

  const handleDeclineAlert = (id: string) => {
    removePendingAlert(id);
  };

  return (
    <Screen scroll>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text style={styles.greetingLabel}>Good morning,</Text>
          <Text style={styles.greetingName}>{firstName}</Text>
        </View>
        <Avatar
          name={user?.fullName}
          source={user?.profilePhotoUrl ?? undefined}
          size="lg"
          online={isAvailable}
        />
      </View>

      {/* Pending Alerts */}
      {pendingAlerts.map((alert) => (
        <View key={alert.id} style={styles.alertWrapper}>
          <EmergencyAlertCard
            type={EMERGENCY_TYPE_LABELS[alert.emergencyType]}
            location={alert.locationAddress || 'Unknown location'}
            eta={alert.etaMinutes ? `${alert.etaMinutes} min` : undefined}
            casualtyCount={alert.casualtyCount}
            ambulanceEta={alert.ambulanceEtaMinutes ? `${alert.ambulanceEtaMinutes} min` : undefined}
            onAccept={() => handleAcceptAlert(alert.id)}
            onDecline={() => handleDeclineAlert(alert.id)}
          />
        </View>
      ))}

      {/* Availability Status */}
      <Card variant={isAvailable ? 'active' : 'outlined'} style={styles.marginBottom4}>
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityInfo}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isAvailable ? colors.success[100] : colors.gray[100] },
              ]}
            >
              <Activity size={20} color={isAvailable ? colors.success[600] : colors.gray[400]} />
            </View>
            <View>
              <Text style={styles.availabilityTitle}>{isAvailable ? 'Available' : 'Off Duty'}</Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable ? 'You will receive emergency alerts' : 'You will not receive alerts'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIsAvailable(!isAvailable)}
            style={[
              styles.toggle,
              { backgroundColor: isAvailable ? colors.success[500] : colors.gray[300] },
            ]}
          >
            <View style={[styles.toggleKnob, isAvailable ? styles.toggleKnobRight : styles.toggleKnobLeft]} />
          </Pressable>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.primary[500] }]}>
              {user?.totalResponses ?? 0}
            </Text>
            <Text style={styles.statLabel}>Responses</Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.success[500] }]}>
              {user?.totalAccepted ?? 0}
            </Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.warning[500] }]}>{avgResponseTime}</Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsList}>
        <Card variant="emergency" onPress={() => router.push('/emergency/report')}>
          <View style={styles.actionRow}>
            <View style={[styles.actionIcon, { backgroundColor: colors.emergency[100] }]}>
              <AlertTriangle size={24} color={colors.emergency[500]} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.emergency[600] }]}>
                Report Emergency
              </Text>
              <Text style={styles.actionSubtitle}>Report a nearby emergency as a witness</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
          </View>
        </Card>

        <Card variant="outlined" onPress={() => router.push('/credentials/green-badge')}>
          <View style={styles.actionRow}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success[100] }]}>
              <CreditCard size={24} color={colors.success[500]} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Green Badge</Text>
              <Text style={styles.actionSubtitle}>Show your verified responder badge</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
          </View>
        </Card>

        <Card variant="outlined" onPress={() => router.push('/(tabs)/alerts')}>
          <View style={styles.actionRow}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
              <Bell size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>View Alerts</Text>
              <Text style={styles.actionSubtitle}>See all active and past emergency alerts</Text>
            </View>
            <ChevronRight size={20} color={colors.gray[400]} />
          </View>
        </Card>
      </View>

      {/* Credentials */}
      <Text style={styles.sectionTitle}>Your Credentials</Text>
      <Card variant="outlined" style={styles.marginBottom8}>
        <View style={styles.credentialRow}>
          <Shield size={24} color={colors.primary[500]} />
          <View style={styles.credentialText}>
            <Text style={styles.credentialName}>{user?.fullName}</Text>
            <Text style={styles.credentialTier}>{user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}</Text>
          </View>
        </View>
        <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  greetingText: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  greetingName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  alertWrapper: {
    marginBottom: spacing[4],
  },
  marginBottom4: {
    marginBottom: spacing[4],
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  availabilitySubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  toggleKnobRight: {
    alignSelf: 'flex-end',
  },
  toggleKnobLeft: {
    alignSelf: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  actionsList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  marginBottom8: {
    marginBottom: spacing[8],
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  credentialText: {
    flex: 1,
  },
  credentialName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  credentialTier: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
});
