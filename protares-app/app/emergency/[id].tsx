import { useState } from 'react';
import { View, Text, Pressable, Linking, ScrollView } from 'react-native';
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
    <View className="flex-row items-center justify-between mb-4">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < stepIndex;
        const isCurrent = i === stepIndex;
        const isUpcoming = i > stepIndex;

        return (
          <View key={step.key} className="items-center flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                isCompleted
                  ? 'bg-success-500'
                  : isCurrent
                  ? 'bg-primary-500'
                  : 'bg-gray-200'
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={16} color="#FFFFFF" />
              ) : (
                <Text
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              className={`text-[10px] text-center ${
                isCurrent
                  ? 'text-primary-500 font-semibold'
                  : isCompleted
                  ? 'text-success-600 font-medium'
                  : 'text-gray-400'
              }`}
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
        <View className="flex-1 items-center justify-center px-8">
          <AlertTriangle size={48} color="#9CA3AF" />
          <Text className="text-lg font-semibold text-gray-700 mt-4 text-center">
            Emergency Not Found
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            This emergency may have been resolved or is no longer available.
          </Text>
          <View className="mt-6">
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

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Status Stepper */}
        <View className="mt-4">
          <StatusStepper currentStep={responseStatus} />
        </View>

        {/* Map Placeholder */}
        <View className="h-44 bg-gray-200 rounded-xl items-center justify-center mb-4">
          <MapPin size={32} color="#005EB8" />
          <Text className="text-sm text-gray-500 mt-2">
            Map view loading...
          </Text>
        </View>

        {/* Location */}
        <Card variant="outlined" className="mb-3">
          <View className="flex-row items-start gap-3">
            <MapPin size={20} color="#005EB8" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 mb-0.5">
                Location
              </Text>
              <Text className="text-sm text-gray-600">
                {emergency.locationAddress || 'Unknown address'}
              </Text>
              {emergency.locationDescription && (
                <Text className="text-xs text-gray-500 mt-1">
                  {emergency.locationDescription}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Description */}
        {emergency.description && (
          <Card variant="outlined" className="mb-3">
            <View className="flex-row items-start gap-3">
              <FileText size={20} color="#005EB8" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 mb-0.5">
                  Description
                </Text>
                <Text className="text-sm text-gray-600">
                  {emergency.description}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Casualties */}
        <Card variant="outlined" className="mb-3">
          <View className="flex-row items-start gap-3">
            <Users size={20} color="#DA291C" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 mb-0.5">
                Casualties
              </Text>
              <Text className="text-sm text-gray-600">
                {emergency.casualtyCount}{' '}
                {emergency.casualtyCount === 1 ? 'person' : 'people'}
              </Text>
              <View className="flex-row gap-4 mt-1">
                <Text className="text-xs text-gray-500">
                  Conscious:{' '}
                  <Text className="font-medium">
                    {emergency.casualtiesConscious === null
                      ? 'Unknown'
                      : emergency.casualtiesConscious
                      ? 'Yes'
                      : 'No'}
                  </Text>
                </Text>
                <Text className="text-xs text-gray-500">
                  Breathing:{' '}
                  <Text className="font-medium">
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
        <Card variant="outlined" className="mb-3">
          <View className="flex-row items-start gap-3">
            <Ambulance size={20} color="#005EB8" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 mb-0.5">
                Ambulance
              </Text>
              {emergency.ambulanceNotified ? (
                <View>
                  <Text className="text-sm text-gray-600">
                    Notified — ETA:{' '}
                    {emergency.ambulanceEtaMinutes
                      ? `${emergency.ambulanceEtaMinutes} minutes`
                      : 'Unknown'}
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-gray-500">Not yet notified</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Equipment */}
        {emergency.equipmentRequested.length > 0 && (
          <Card variant="outlined" className="mb-3">
            <View className="flex-row items-start gap-3">
              <Thermometer size={20} color="#005EB8" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 mb-1">
                  Equipment Requested
                </Text>
                <View className="flex-row flex-wrap gap-2">
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
        <View className="gap-3 mt-4 mb-8">
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

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                variant="emergency"
                fullWidth
                icon={Phone}
                onPress={() => Linking.openURL('tel:999')}
              >
                Call 999
              </Button>
            </View>

            <View className="flex-1">
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
