import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Download, Trash, ShieldAlert } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, spacing, typography } from '@/config/theme';

export default function PrivacyScreen() {
  const user = useAuthStore((s) => s.user);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gdpr-export', {
        body: { userId: user?.id },
      });
      if (error) throw error;
      const url = typeof (data as { url?: string })?.url === 'string' ? (data as { url: string }).url : null;
      Alert.alert(
        'Export requested',
        url
          ? `Your data is ready to download: ${url}`
          : "We've started your data export. You'll receive an email with a download link within 7 days."
      );
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'gdpr.export' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account?',
      'Your account will be scheduled for deletion. You have 30 days to cancel this request by signing in again. After 30 days, all your data is permanently erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase.functions.invoke('gdpr-delete', {
                body: { userId: user?.id },
              });
              if (error) throw error;
              Alert.alert(
                'Deletion scheduled',
                'Your account will be permanently deleted in 30 days. Sign in again to cancel.'
              );
            } catch (err) {
              const mapped = mapError(err);
              captureException(err, { context: 'gdpr.delete' });
              Alert.alert(mapped.title, mapped.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable padded={false}>
      <Header title="Privacy & data" showBack />
      <View style={styles.body}>
        <Card elevated style={styles.card}>
          <View style={styles.row}>
            <ShieldAlert size={22} color={colors.nhsBlue} />
            <Text style={styles.title}>Your rights under UK GDPR</Text>
          </View>
          <Text style={styles.body2}>
            You can request a copy of your data, correct inaccurate information,
            object to processing, or ask us to delete your account.
          </Text>
        </Card>

        <Card elevated style={styles.card}>
          <Text style={styles.title}>Export my data</Text>
          <Text style={styles.body2}>
            Download a JSON archive containing your profile, credentials,
            consent records, and response history.
          </Text>
          <Button
            label="Request data export"
            onPress={handleExport}
            loading={exporting}
            leftIcon={<Download size={18} color={colors.white} />}
            size="lg"
            fullWidth
          />
        </Card>

        <Card elevated style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>Delete my account</Text>
          <Text style={styles.body2}>
            This schedules your account for deletion. You have 30 days to sign
            in again to cancel. After that, all your data is permanently
            removed.
          </Text>
          <Button
            label="Delete account"
            variant="outline"
            size="lg"
            onPress={handleDelete}
            loading={deleting}
            leftIcon={<Trash size={18} color={colors.emergencyRed} />}
            fullWidth
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  card: { padding: spacing.lg, gap: spacing.md },
  dangerCard: {
    borderColor: colors.emergencyRed,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  dangerTitle: {
    ...typography.h3,
    color: colors.emergencyRed,
  },
  body2: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
