import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Volume2,
  Vibrate,
  Bell,
  Lock,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/config/theme';

function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.toggleBase,
        value ? styles.toggleOn : styles.toggleOff,
      ]}
    >
      <View
        style={[
          styles.toggleKnob,
          value ? styles.toggleKnobOn : styles.toggleKnobOff,
        ]}
      />
    </Pressable>
  );
}

interface SettingsNavItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
}

function SettingsNavItem({
  icon: Icon,
  label,
  description,
  onPress,
}: SettingsNavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navItem,
        pressed && { backgroundColor: colors.gray[50] },
      ]}
    >
      <View style={styles.navIconCircle}>
        <Icon size={20} color="#005EB8" />
      </View>
      <View style={styles.navTextBlock}>
        <Text style={styles.navLabel}>{label}</Text>
        <Text style={styles.navDescription}>{description}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  return (
    <Screen safeArea padded={false}>
      <Header title="Settings" />
      <View style={styles.container}>
        {/* Alert Preferences */}
        <Text style={styles.sectionTitleTop}>
          Alert Preferences
        </Text>

        <Card variant="outlined" style={styles.sectionCard}>
          <View style={styles.toggleRowBordered}>
            <View style={styles.toggleRowLeft}>
              <View style={styles.toggleIconCircle}>
                <Volume2 size={20} color="#005EB8" />
              </View>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>
                  Sound
                </Text>
                <Text style={styles.toggleDescription}>
                  Play alert sounds for emergencies
                </Text>
              </View>
            </View>
            <Toggle
              value={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleRowLeft}>
              <View style={styles.toggleIconCircle}>
                <Vibrate size={20} color="#005EB8" />
              </View>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>
                  Vibration
                </Text>
                <Text style={styles.toggleDescription}>
                  Haptic feedback for alerts
                </Text>
              </View>
            </View>
            <Toggle
              value={vibrationEnabled}
              onToggle={() => setVibrationEnabled(!vibrationEnabled)}
            />
          </View>
        </Card>

        {/* Navigation Items */}
        <Text style={styles.sectionTitle}>General</Text>

        <Card variant="outlined" style={styles.sectionCard}>
          <SettingsNavItem
            icon={Bell}
            label="Notifications"
            description="Push notification and SMS preferences"
            onPress={() => {
              // Navigate to notifications settings
            }}
          />
          <SettingsNavItem
            icon={Lock}
            label="Privacy"
            description="Location tracking and data preferences"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsNavItem
            icon={Info}
            label="About"
            description="App version, legal information"
            onPress={() => {
              // Navigate to about screen
            }}
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoVersion}>
            ProtaRes v1.0.0
          </Text>
          <Text style={styles.appInfoTagline}>
            Community Emergency Response Network
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
  },
  toggleBase: {
    width: 48,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    paddingHorizontal: spacing[0.5],
  },
  toggleOn: {
    backgroundColor: colors.primary[500],
  },
  toggleOff: {
    backgroundColor: colors.gray[300],
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  navIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTextBlock: {
    flex: 1,
  },
  navLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  navDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  sectionTitleTop: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  sectionCard: {
    marginBottom: spacing[6],
  },
  toggleRowBordered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  toggleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  toggleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextBlock: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  toggleDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  appInfoVersion: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  appInfoTagline: {
    fontSize: fontSize.xs,
    color: colors.gray[300],
    marginTop: spacing[1],
  },
});
