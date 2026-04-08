import { useState } from 'react';
import { View, Text, Pressable, Linking, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin,
  Clock,
  Users,
  Ambulance,
  Phone,
  Video,
  Navigation,
  AlertTriangle,
  Heart,
  CheckCircle,
  ChevronRight,
  FileText,
  Thermometer,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';
import type { ResponseStatus } from '@/types';

const STATUS_STEPS: { key: ResponseStatus; label: string }[] = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'en_route', label: 'En Route' },
  { key: 'on_scene', label: 'On Scene' },
  { key: 'intervening', label: 'Intervening' },
  { key: 'completing', label: 'Completing' },
  { key: 'completed', label: 'Completed' },
];

function StatusStepper({ currentStep }: { currentStep: ResponseStatus }) {
  const stepIndex = STATUS_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.stepperRow}>
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < stepIndex;
        const isCurrent = i === stepIndex;
        const isUpcoming = i > stepIndex;

        return (
          <View key={step.key} style={styles.stepperItem}>
            <View
              style={[
                styles.stepperCircle,
                isCompleted
                  ? styles.stepperCircleCompleted
                  : isCurrent
                  ? styles.stepperCircleCurrent
                  : styles.stepperCircleUpcoming,
              ]}
            >
              {isCompleted ? (
                <CheckCircle size={16} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepperNumber,
                    isCurrent ? styles.stepperNumberCurrent : styles.stepperNumberUpcoming,
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepperLabel,
                isCurrent
                  ? styles.stepperLabelCurrent
                  : isCompleted
                  ? styles.stepperLabelCompleted
                  : styles.stepperLabelUpcoming,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error',
  serious: 'warning',
  moderate: 'info',
  minor: 'default',
};

export default function EmergencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);

  const emergency = pendingAlerts.find((a) => a.id === id);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>('accepted');

  if (!emergency) {
    return (
      <Screen>
        <Header title="Emergency" />
        <View style={styles.notFoundWrapper}>
          <AlertTriangle size={48} color="#9CA3AF" />
          <Text style={styles.notFoundTitle}>
            Emergency Not Found
          </Text>
          <Text style={styles.notFoundSubtitle}>
            This emergency may have been resolved or is no longer available.
          </Text>
          <View style={styles.notFoundButton}>
            <Button variant="primary" onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const advanceStatus = () => {
    const stepIndex = STATUS_STEPS.findIndex((s) => s.key === responseStatus);
    if (stepIndex < STATUS_STEPS.length - 1) {
      setResponseStatus(STATUS_STEPS[stepIndex + 1].key);
    }
  };

  const nextStepLabel = (() => {
    const stepIndex = STATUS_STEPS.findIndex((s) => s.key === responseStatus);
    if (stepIndex < STATUS_STEPS.length - 1) {
      return STATUS_STEPS[stepIndex + 1].label;
    }
    return null;
  })();

  return (
    <Screen safeArea padded={false}>
      <Header
        title={EMERGENCY_TYPE_LABELS[emergency.emergencyType]}
        rightAction={
          <Badge variant={SEVERITY_VARIANT[emergency.severity] ?? 'default'}>
            {emergency.severity.charAt(0).toUpperCase() +
              emergency.severity.slice(1)}
          </Badge>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Stepper */}
        <View style={styles.stepperWrapper}>
          <StatusStepper currentStep={responseStatus} />
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <MapPin size={32} color="#005EB8" />
          <Text style={styles.mapPlaceholderText}>
            Map view loading...
          </Text>
        </View>

        {/* Location */}
        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.cardRow}>
            <MapPin size={20} color="#005EB8" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Location
              </Text>
              <Text style={styles.cardBodyText}>
                {emergency.locationAddress || 'Unknown address'}
              </Text>
              {emergency.locationDescription && (
                <Text style={styles.cardMutedText}>
                  {emergency.locationDescription}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Description */}
        {emergency.description && (
          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.cardRow}>
              <FileText size={20} color="#005EB8" />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  Description
                </Text>
                <Text style={styles.cardBodyText}>
                  {emergency.description}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Casualties */}
        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.cardRow}>
            <Users size={20} color="#DA291C" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Casualties
              </Text>
              <Text style={styles.cardBodyText}>
                {emergency.casualtyCount}{' '}
                {emergency.casualtyCount === 1 ? 'person' : 'people'}
              </Text>
              <View style={styles.casualtyStatsRow}>
                <Text style={styles.casualtyStatText}>
                  Conscious:{' '}
                  <Text style={styles.casualtyStatBold}>
                    {emergency.casualtiesConscious === null
                      ? 'Unknown'
                      : emergency.casualtiesConscious
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </Text>
                <Text style={styles.casualtyStatText}>
                  Breathing:{' '}
                  <Text style={styles.casualtyStatBold}>
                    {emergency.casualtiesBreathing === null
                      ? 'Unknown'
                      : emergency.casualtiesBreathing
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Ambulance ETA */}
        <Card variant="outlined" style={styles.detailCard}>
          <View style={styles.cardRow}>
            <Ambulance size={20} color="#005EB8" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                Ambulance
              </Text>
              {emergency.ambulanceNotified ? (
                <View>
                  <Text style={styles.cardBodyText}>
                    Notified — ETA:{' '}
                    {emergency.ambulanceEtaMinutes
                      ? `${emergency.ambulanceEtaMinutes} minutes`
                      : 'Unknown'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.cardMutedBody}>Not yet notified</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Equipment */}
        {emergency.equipmentRequested.length > 0 && (
          <Card variant="outlined" style={styles.detailCard}>
            <View style={styles.cardRow}>
              <Thermometer size={20} color="#005EB8" />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitleTight}>
                  Equipment Requested
                </Text>
                <View style={styles.equipmentRow}>
                  {emergency.equipmentRequested.map((eq) => (
                    <Badge key={eq} variant="info">
                      {eq.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  ))}
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsWrapper}>
          {nextStepLabel && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={Navigation}
              onPress={advanceStatus}
            >
              {nextStepLabel === 'En Route'
                ? 'Start Navigation'
                : nextStepLabel === 'On Scene'
                ? 'Arrived On Scene'
                : nextStepLabel === 'Intervening'
                ? 'Begin Intervention'
                : nextStepLabel === 'Completing'
                ? 'Begin Handover'
                : 'Mark Complete'}
            </Button>
          )}

          {responseStatus === 'completed' && (
            <Button
              variant="success"
              size="lg"
              fullWidth
              icon={CheckCircle}
              onPress={() => router.back()}
            >
              Done
            </Button>
          )}

          <View style={styles.buttonRow}>
            <View style={styles.buttonFlex}>
              <Button
                variant="emergency"
                fullWidth
                icon={Phone}
                onPress={() => Linking.openURL('tel:999')}
              >
                Call 999
              </Button>
            </View>

            <View style={styles.buttonFlex}>
              <Button
                variant="secondary"
                fullWidth
                icon={Video}
                onPress={() => {
                  // Witness video functionality
                }}
              >
                Witness Video
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  stepperItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepperCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  stepperCircleCompleted: {
    backgroundColor: colors.success[500],
  },
  stepperCircleCurrent: {
    backgroundColor: colors.primary[500],
  },
  stepperCircleUpcoming: {
    backgroundColor: colors.gray[200],
  },
  stepperNumber: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  stepperNumberCurrent: {
    color: colors.white,
  },
  stepperNumberUpcoming: {
    color: colors.gray[400],
  },
  stepperLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stepperLabelCurrent: {
    color: colors.primary[500],
    fontWeight: fontWeight.semibold,
  },
  stepperLabelCompleted: {
    color: colors.success[600],
    fontWeight: fontWeight.medium,
  },
  stepperLabelUpcoming: {
    color: colors.gray[400],
  },
  notFoundWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  notFoundTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[700],
    marginTop: spacing[4],
    textAlign: 'center',
  },
  notFoundSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  notFoundButton: {
    marginTop: spacing[6],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  stepperWrapper: {
    marginTop: spacing[4],
  },
  mapPlaceholder: {
    height: 176,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  mapPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[2],
  },
  detailCard: {
    marginBottom: spacing[3],
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing[0.5],
  },
  cardTitleTight: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing[1],
  },
  cardBodyText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  cardMutedText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  cardMutedBody: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  casualtyStatsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[1],
  },
  casualtyStatText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  casualtyStatBold: {
    fontWeight: fontWeight.medium,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  actionsWrapper: {
    gap: spacing[3],
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  buttonFlex: {
    flex: 1,
  },
});
