import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth';
import { useUpdateProfile } from '@/hooks/useProfile';
import { colors, radii, spacing, touchTargets, typography } from '@/config/theme';

const MIN_RADIUS_KM = 0.5;
const MAX_RADIUS_KM = 20;
const RADIUS_STEP_KM = 0.5;

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const router = useRouter();

  if (!user) return null;

  const clampRadius = (value: number) =>
    Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, Math.round(value * 2) / 2));

  const handleRadiusDelta = (delta: number) => {
    const next = clampRadius(user.alertRadiusKm + delta);
    if (next !== user.alertRadiusKm) {
      updateProfile.mutate({ alertRadiusKm: next });
    }
  };

  const handleToggleSms = (value: boolean) => {
    updateProfile.mutate({ smsFallbackEnabled: value });
  };

  const handleTogglePush = (value: boolean) => {
    updateProfile.mutate({ pushEnabled: value });
  };

  return (
    <Screen scrollable padded={false}>
      <Header title="Settings" showBack />

      <View style={styles.body}>
        <Card elevated style={styles.card}>
          <Text style={styles.sectionTitle}>Alert radius</Text>
          <Text style={styles.sectionBody}>
            Only emergencies within {user.alertRadiusKm.toFixed(1)} km will alert
            you.
          </Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleRadiusDelta(-RADIUS_STEP_KM)}
              accessibilityRole="button"
              accessibilityLabel="Decrease alert radius"
              disabled={user.alertRadiusKm <= MIN_RADIUS_KM}
            >
              <Minus size={20} color={colors.nhsBlue} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>
              {user.alertRadiusKm.toFixed(1)} km
            </Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleRadiusDelta(RADIUS_STEP_KM)}
              accessibilityRole="button"
              accessibilityLabel="Increase alert radius"
              disabled={user.alertRadiusKm >= MAX_RADIUS_KM}
            >
              <Plus size={20} color={colors.nhsBlue} />
            </TouchableOpacity>
          </View>
        </Card>

        <Card elevated style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.sectionTitle}>Push notifications</Text>
              <Text style={styles.sectionBody}>
                Receive emergency alerts on this device.
              </Text>
            </View>
            <Switch
              value={user.pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ true: colors.nhsBlue, false: colors.grey2 }}
              thumbColor={colors.white}
              accessibilityLabel="Toggle push notifications"
            />
          </View>
        </Card>

        <Card elevated style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.sectionTitle}>SMS fallback</Text>
              <Text style={styles.sectionBody}>
                If push fails, send critical alerts via SMS.
              </Text>
            </View>
            <Switch
              value={user.smsFallbackEnabled}
              onValueChange={handleToggleSms}
              trackColor={{ true: colors.nhsBlue, false: colors.grey2 }}
              thumbColor={colors.white}
              accessibilityLabel="Toggle SMS fallback"
            />
          </View>
        </Card>

        <Card
          elevated
          style={styles.card}
          onTouchEnd={() => router.push('/settings/privacy')}
        >
          <Text style={styles.sectionTitle}>Privacy & data</Text>
          <Text style={styles.sectionBody}>
            Manage consent, export your data, or delete your account.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  card: { padding: spacing.lg, gap: spacing.sm },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleText: { flex: 1 },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stepperButton: {
    width: touchTargets.recommended,
    height: touchTargets.recommended,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.nhsBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...typography.h2,
    color: colors.nhsBlue,
  },
});
