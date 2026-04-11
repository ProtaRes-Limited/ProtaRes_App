import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Video, AlertTriangle, Check } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { reportEmergency } from '@/services/emergencies';
import { getCurrentCoordinates } from '@/services/location';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { EMERGENCY_SERVICE_NUMBER } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/config/theme';
import type { EmergencySeverity, EmergencyType } from '@/types';

const QUICK_TYPES: Array<{ value: EmergencyType; label: string; severity: EmergencySeverity }> = [
  { value: 'cardiac_arrest', label: 'Cardiac arrest', severity: 'critical' },
  { value: 'stroke', label: 'Stroke', severity: 'critical' },
  { value: 'heart_attack', label: 'Heart attack', severity: 'critical' },
  { value: 'breathing_difficulty', label: 'Breathing difficulty', severity: 'serious' },
  { value: 'choking', label: 'Choking', severity: 'serious' },
  { value: 'anaphylaxis', label: 'Anaphylaxis', severity: 'serious' },
  { value: 'seizure', label: 'Seizure', severity: 'moderate' },
  { value: 'serious_fall', label: 'Serious fall', severity: 'serious' },
  { value: 'other_medical', label: 'Other medical', severity: 'moderate' },
];

/**
 * Witness Mode entry point. Single screen, three big buttons, minimal
 * typing. Designed to be usable by somebody in shock.
 */
export default function ReportEmergencyScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCall999 = () => {
    Linking.openURL(`tel:${EMERGENCY_SERVICE_NUMBER}`).catch(() =>
      Alert.alert('Unable to open dialer. Please call 999 directly.')
    );
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Choose an emergency type', 'Select the closest match from the list.');
      return;
    }

    setSubmitting(true);
    try {
      const location = await getCurrentCoordinates();
      if (!location) {
        Alert.alert(
          'Location required',
          'We need your location to dispatch help. Please enable location and try again.'
        );
        return;
      }

      const severity = QUICK_TYPES.find((t) => t.value === selectedType)?.severity ?? 'moderate';
      const id = await reportEmergency({
        emergencyType: selectedType,
        severity,
        location,
        description: notes || undefined,
      });

      Alert.alert(
        'Help is on the way',
        'We have alerted nearby responders and notified emergency services. Stay with the patient if safe to do so.',
        [
          {
            text: 'Start live stream',
            onPress: () =>
              router.replace({
                pathname: '/emergency/witness-mode',
                params: { id },
              }),
          },
          { text: 'OK', style: 'default' },
        ]
      );
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'report.submit' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable withKeyboardAvoid padded={false}>
      <Header title="Report emergency" showBack />

      <View style={styles.body}>
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color={colors.emergencyRed} />
          <Text style={styles.warningText}>
            If this is an immediate threat to life, dial {EMERGENCY_SERVICE_NUMBER}{' '}
            first. ProtaRes supplements — never replaces — emergency services.
          </Text>
        </View>

        <Button
          label={`Call ${EMERGENCY_SERVICE_NUMBER} now`}
          variant="emergency"
          size="emergency"
          leftIcon={<Phone size={20} color={colors.white} />}
          onPress={handleCall999}
          fullWidth
        />

        <Text style={styles.sectionLabel}>What's happening?</Text>
        <View style={styles.grid}>
          {QUICK_TYPES.map(({ value, label }) => {
            const active = selectedType === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => setSelectedType(value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                {active ? (
                  <Check size={16} color={colors.white} />
                ) : null}
                <Text
                  style={[styles.typeChipLabel, active && styles.typeChipLabelActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Anything else the responders should know?"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Patient is behind the ticket barriers on platform 3"
          multiline
          numberOfLines={3}
        />

        <Card style={styles.consentCard}>
          <Text style={styles.consentText}>
            Submitting this report shares your current GPS location with
            ProtaRes dispatchers and nearby verified responders.
          </Text>
        </Card>

        <Button
          label="Send alert"
          variant="primary"
          size="lg"
          leftIcon={<Video size={18} color={colors.white} />}
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: '#FBE6E4',
    borderWidth: 1,
    borderColor: colors.emergencyRed,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.emergencyRed,
    flex: 1,
    lineHeight: 20,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: {
    borderColor: colors.nhsBlue,
    backgroundColor: colors.nhsBlue,
  },
  typeChipLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeChipLabelActive: { color: colors.white },
  consentCard: {
    backgroundColor: colors.paleGrey,
    padding: spacing.md,
  },
  consentText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
