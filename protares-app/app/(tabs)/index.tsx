import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIcon, MapPin, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import { useLocation } from '@/hooks/useLocation';
import { useSetAvailability } from '@/hooks/useProfile';
import { colors, radii, spacing, typography } from '@/config/theme';

const tierLabels: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'neutral' }> = {
  tier1_active_healthcare: { label: 'Active Healthcare', variant: 'success' },
  tier2_retired_healthcare: { label: 'Retired Healthcare', variant: 'info' },
  tier3_first_aid: { label: 'First Aider', variant: 'warning' },
  tier4_witness: { label: 'Witness', variant: 'neutral' },
};

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const locationState = useLocationStore();
  const setAvailabilityMutation = useSetAvailability();
  const router = useRouter();
  useLocation();

  if (!user) return null;

  const tierMeta = tierLabels[user.tier] ?? tierLabels.tier4_witness!;
  const isAvailable = user.availability === 'available';

  const handleToggle = (next: boolean) => {
    setAvailabilityMutation.mutate(next ? 'available' : 'unavailable');
  };

  return (
    <Screen scrollable padded={false}>
      <Header title="ProtaRes" subtitle={`Welcome back, ${user.firstName}`} />

      <View style={styles.body}>
        {/* Availability */}
        <Card elevated style={styles.availabilityCard}>
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityTextBlock}>
              <Text style={styles.availabilityTitle}>
                {isAvailable ? 'You are available' : 'You are off duty'}
              </Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable
                  ? 'You will be alerted to nearby emergencies.'
                  : 'Toggle on when ready to respond.'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggle}
              trackColor={{ true: colors.successGreen, false: colors.grey2 }}
              thumbColor={colors.white}
              accessibilityLabel="Availability toggle"
              accessibilityHint={
                isAvailable ? 'Disable to go off duty' : 'Enable to become available'
              }
            />
          </View>
          <View style={styles.badgeRow}>
            <Badge label={tierMeta.label} variant={tierMeta.variant} />
            {locationState.transportMode ? (
              <Badge label={titleCase(locationState.transportMode)} variant="info" />
            ) : null}
          </View>
        </Card>

        {/* Credentials CTA */}
        <TouchableOpacity
          onPress={() => router.push('/credentials')}
          activeOpacity={0.85}
        >
          <Card elevated style={styles.credentialsCard}>
            <View style={styles.cardIcon}>
              <ShieldCheck size={24} color={colors.successGreen} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Credentials</Text>
              <Text style={styles.cardSubtitle}>
                Verify GMC, NMC or HCPC registration to unlock Green Badge.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Location status */}
        <Card elevated style={styles.credentialsCard}>
          <View style={styles.cardIcon}>
            <MapPin size={24} color={colors.nhsBlue} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Location</Text>
            <Text style={styles.cardSubtitle}>
              {locationState.current
                ? `Tracking: ${locationState.current.latitude.toFixed(3)}, ${locationState.current.longitude.toFixed(3)}`
                : user.locationConsent
                  ? 'Waiting for location lock…'
                  : 'Location sharing is off. Enable from Settings to go available.'}
            </Text>
          </View>
        </Card>

        {/* Stats */}
        <Card elevated style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatBlock label="Total responses" value={user.totalResponses} />
            <StatBlock label="Accepted" value={user.totalAccepted} />
            <StatBlock
              label="Avg response"
              value={
                user.averageResponseTimeSeconds
                  ? `${Math.round(user.averageResponseTimeSeconds / 60)}m`
                  : '—'
              }
            />
          </View>
        </Card>

        {/* Impact */}
        <Card elevated style={styles.impactCard}>
          <ActivityIcon size={20} color={colors.successGreen} />
          <Text style={styles.impactText}>
            Every minute matters. ProtaRes supplements — never replaces —
            emergency services. Dial 999 for all emergencies.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

function StatBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  availabilityCard: { padding: spacing.lg },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityTextBlock: { flex: 1, marginRight: spacing.md },
  availabilityTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  availabilitySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  credentialsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.paleGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsCard: { padding: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: { alignItems: 'center', flex: 1 },
  statValue: {
    ...typography.h1,
    color: colors.nhsBlue,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  impactCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: '#E6F3EC',
    borderColor: colors.successGreen,
  },
  impactText: {
    ...typography.bodySmall,
    color: colors.darkGreen,
    flex: 1,
    lineHeight: 20,
  },
});
