import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck, ShieldOff } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { listCredentials } from '@/services/credentials';
import { colors, spacing, typography } from '@/config/theme';

export default function CredentialsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['credentials'],
    queryFn: listCredentials,
  });

  return (
    <Screen scrollable padded={false}>
      <Header title="Credentials" showBack />

      <View style={styles.body}>
        <Text style={styles.description}>
          Verify your professional registration to unlock Active Responder
          tier and show your Green Badge to arriving EMS.
        </Text>

        {isLoading ? (
          <LoadingSpinner label="Loading credentials…" />
        ) : data && data.length > 0 ? (
          <View style={styles.list}>
            {data.map((cred) => {
              const isVerified = cred.verification_status === 'verified';
              return (
                <Card key={cred.id} elevated style={styles.credCard}>
                  <View style={styles.credRow}>
                    {isVerified ? (
                      <ShieldCheck size={24} color={colors.successGreen} />
                    ) : (
                      <ShieldOff size={24} color={colors.grey3} />
                    )}
                    <View style={styles.credBody}>
                      <Text style={styles.credTitle}>
                        {cred.credential_type?.toUpperCase() ?? 'CREDENTIAL'}
                      </Text>
                      <Text style={styles.credSubtitle}>
                        {cred.verification_status === 'verified'
                          ? `Verified ${cred.verified_at ? new Date(cred.verified_at).toLocaleDateString() : ''}`
                          : cred.verification_status === 'pending'
                            ? 'Pending verification'
                            : (cred.verification_status ?? 'Unknown status')}
                      </Text>
                    </View>
                    <Badge
                      label={isVerified ? 'Verified' : 'Pending'}
                      variant={isVerified ? 'success' : 'neutral'}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card elevated style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No credentials yet</Text>
            <Text style={styles.emptyBody}>
              Add your GMC, NMC or HCPC registration to become a verified
              responder.
            </Text>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            label="Add credential"
            leftIcon={<Plus size={18} color={colors.white} />}
            onPress={() => router.push('/credentials/verify')}
            size="lg"
            fullWidth
          />
          {data && data.some((c) => c.verification_status === 'verified') ? (
            <Button
              label="Show Green Badge"
              variant="outline"
              onPress={() => router.push('/credentials/green-badge')}
              size="lg"
              fullWidth
            />
          ) : null}
          <Button label="Refresh" variant="ghost" onPress={() => refetch()} fullWidth />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.sm },
  credCard: { padding: spacing.lg },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  credBody: { flex: 1 },
  credTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  credSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
