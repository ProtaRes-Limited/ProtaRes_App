import { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import {
  MapPin,
  BarChart3,
  Mail,
  Download,
  Trash2,
  ShieldAlert,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
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

export default function PrivacyScreen() {
  const user = useAuthStore((s) => s.user);
  const [locationTracking, setLocationTracking] = useState(
    user?.locationConsent ?? true
  );
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of all your data and send it to your registered email address. This may take up to 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            Alert.alert(
              'Request Sent',
              'Your data export has been requested. You will receive it via email.'
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data including response history, credentials, and personal information will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion Requested',
              'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.'
            );
          },
        },
      ]
    );
  };

  return (
    <Screen safeArea padded={false}>
      <Header title="Privacy" />
      <View style={styles.container}>
        {/* Location */}
        <Text style={styles.sectionTitleTop}>
          Location
        </Text>

        <Card variant="outlined" style={styles.sectionCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleRowLeft}>
              <View style={[styles.iconCircle, styles.iconCirclePrimary]}>
                <MapPin size={20} color="#005EB8" />
              </View>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>
                  Location Tracking
                </Text>
                <Text style={styles.toggleDescription}>
                  Required to receive nearby emergency alerts
                </Text>
              </View>
            </View>
            <Toggle
              value={locationTracking}
              onToggle={() => setLocationTracking(!locationTracking)}
            />
          </View>

          {!locationTracking && (
            <View style={styles.warningBox}>
              <View style={styles.warningRow}>
                <ShieldAlert size={16} color="#D97706" />
                <Text style={styles.warningText}>
                  Disabling location tracking means you will not receive
                  emergency alerts based on proximity. You can still use the app
                  for manual reporting.
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Consent Preferences */}
        <Text style={styles.sectionTitle}>
          Consent Preferences
        </Text>

        <Card variant="outlined" style={styles.sectionCard}>
          <View style={styles.toggleRowBordered}>
            <View style={styles.toggleRowLeft}>
              <View style={[styles.iconCircle, styles.iconCircleGray]}>
                <BarChart3 size={20} color="#005EB8" />
              </View>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>
                  Analytics
                </Text>
                <Text style={styles.toggleDescription}>
                  Help us improve by sharing usage data
                </Text>
              </View>
            </View>
            <Toggle
              value={analyticsConsent}
              onToggle={() => setAnalyticsConsent(!analyticsConsent)}
            />
          </View>

          <View style={styles.toggleRowInner}>
            <View style={styles.toggleRowLeft}>
              <View style={[styles.iconCircle, styles.iconCircleGray]}>
                <Mail size={20} color="#005EB8" />
              </View>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>
                  Marketing
                </Text>
                <Text style={styles.toggleDescription}>
                  Receive updates about new features
                </Text>
              </View>
            </View>
            <Toggle
              value={marketingConsent}
              onToggle={() => setMarketingConsent(!marketingConsent)}
            />
          </View>
        </Card>

        {/* Data Actions */}
        <Text style={styles.sectionTitle}>
          Your Data
        </Text>

        <View style={styles.dataActions}>
          <Button
            variant="secondary"
            fullWidth
            icon={Download}
            onPress={handleDownloadData}
          >
            Download My Data
          </Button>

          <Button
            variant="danger"
            fullWidth
            icon={Trash2}
            onPress={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </View>

        {/* GDPR Note */}
        <Card variant="outlined" style={styles.gdprCard}>
          <Text style={styles.gdprText}>
            Your data is processed in accordance with the UK GDPR and Data
            Protection Act 2018. ProtaRes only collects data necessary for
            emergency response coordination. For more information, please review
            our Privacy Policy.
          </Text>
        </Card>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleRowBordered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  toggleRowInner: {
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePrimary: {
    backgroundColor: colors.primary[100],
  },
  iconCircleGray: {
    backgroundColor: colors.gray[100],
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
  warningBox: {
    marginTop: spacing[3],
    backgroundColor: colors.warning[50],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.warning[700],
  },
  dataActions: {
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  gdprCard: {
    marginBottom: spacing[8],
  },
  gdprText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    lineHeight: 20,
  },
});
