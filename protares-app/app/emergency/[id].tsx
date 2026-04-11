import React from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Phone, Navigation, Check } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusStepper } from '@/components/emergency/StatusStepper';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getEmergency } from '@/services/emergencies';
import { useMarkOnScene, useMarkHandover, useUpdateEmergencyStatus } from '@/hooks/useEmergencies';
import { useLocationStore } from '@/stores/location';
import { formatDistance } from '@/lib/distance';
import { EMERGENCY_SERVICE_NUMBER } from '@/lib/constants';
import { colors, spacing, typography } from '@/config/theme';

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const current = useLocationStore((s) => s.current);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['emergency', id],
    enabled: Boolean(id),
    queryFn: () => getEmergency(id!, current),
  });
  const markOnScene = useMarkOnScene();
  const markHandover = useMarkHandover();
  const updateStatus = useUpdateEmergencyStatus();

  if (isLoading) {
    return (
      <Screen>
        <LoadingSpinner label="Loading emergency…" />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <Header title="Emergency" showBack />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This emergency was not found or has been resolved.</Text>
          <Button label="Close" onPress={() => router.back()} variant="outline" />
        </View>
      </Screen>
    );
  }

  const handleCall999 = () => {
    Linking.openURL(`tel:${EMERGENCY_SERVICE_NUMBER}`).catch(() =>
      Alert.alert('Unable to open dialer')
    );
  };

  const handleNavigate = () => {
    const { latitude, longitude } = data.location;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Unable to open navigation'));
    updateStatus.mutate(
      { id: data.id, status: 'responder_en_route' },
      { onSuccess: () => refetch() }
    );
  };

  const handleOnScene = () => {
    markOnScene.mutate(data.id, { onSuccess: () => refetch() });
  };

  const handleHandover = () => {
    markHandover.mutate(data.id, {
      onSuccess: () => {
        refetch();
        router.back();
      },
    });
  };

  return (
    <Screen scrollable padded={false}>
      <Header title="Emergency" showBack />
      <View style={styles.body}>
        <Card elevated style={styles.headerCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.type}>
              {data.emergencyType.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Badge
              label={data.severity.toUpperCase()}
              variant={data.severity === 'critical' ? 'emergency' : 'warning'}
            />
          </View>
          {data.distanceMeters != null ? (
            <Text style={styles.distance}>
              {formatDistance(data.distanceMeters)} from you
            </Text>
          ) : null}
          {data.locationAddress ? (
            <Text style={styles.address}>{data.locationAddress}</Text>
          ) : null}
          {data.locationDescription ? (
            <Text style={styles.descriptionText}>{data.locationDescription}</Text>
          ) : null}
        </Card>

        <Card elevated>
          <StatusStepper currentStatus={data.status} />
        </Card>

        {data.description ? (
          <Card elevated>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{data.description}</Text>
          </Card>
        ) : null}

        <Card elevated>
          <Text style={styles.sectionTitle}>Casualty</Text>
          <Text style={styles.description}>
            {data.casualtyCount} casualty
            {data.casualtyCount !== 1 ? 'ies' : ''}
          </Text>
          {data.casualtiesConscious != null ? (
            <Text style={styles.description}>
              {data.casualtiesConscious ? 'Conscious' : 'Unconscious'}
            </Text>
          ) : null}
          {data.casualtiesBreathing != null ? (
            <Text style={styles.description}>
              {data.casualtiesBreathing ? 'Breathing' : 'Not breathing'}
            </Text>
          ) : null}
        </Card>

        {data.equipmentRequested.length > 0 ? (
          <Card elevated>
            <Text style={styles.sectionTitle}>Equipment requested</Text>
            <View style={styles.badgeRow}>
              {data.equipmentRequested.map((eq) => (
                <Badge key={eq} label={eq.toUpperCase()} variant="info" />
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={`Call ${EMERGENCY_SERVICE_NUMBER}`}
            variant="emergency"
            size="emergency"
            leftIcon={<Phone size={20} color={colors.white} />}
            onPress={handleCall999}
            fullWidth
          />

          <Button
            label="Navigate to scene"
            variant="primary"
            size="lg"
            leftIcon={<Navigation size={18} color={colors.white} />}
            onPress={handleNavigate}
            fullWidth
          />

          {data.status === 'responder_en_route' ? (
            <Button
              label="I'm on scene"
              variant="secondary"
              size="lg"
              leftIcon={<Check size={18} color={colors.white} />}
              onPress={handleOnScene}
              loading={markOnScene.isPending}
              fullWidth
            />
          ) : null}

          {data.status === 'responder_on_scene' ? (
            <Button
              label="Hand over to EMS"
              variant="outline"
              size="lg"
              onPress={handleHandover}
              loading={markHandover.isPending}
              fullWidth
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  headerCard: { padding: spacing.lg, gap: spacing.sm },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  type: {
    ...typography.h2,
    color: colors.emergencyRed,
    flex: 1,
  },
  distance: {
    ...typography.body,
    color: colors.textPrimary,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  descriptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  notFound: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
