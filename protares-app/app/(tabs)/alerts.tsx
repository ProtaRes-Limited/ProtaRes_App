import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmergencyAlertCard } from '@/components/emergency/EmergencyAlertCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { useActiveEmergencies, useAcceptEmergency, useDeclineEmergency } from '@/hooks/useEmergencies';
import { useRealtimeEmergency } from '@/hooks/useRealtimeEmergency';
import { colors, spacing, typography } from '@/config/theme';
import type { Emergency } from '@/types';

export default function AlertsScreen() {
  const { data, isLoading, refetch } = useActiveEmergencies();
  const accept = useAcceptEmergency();
  const decline = useDeclineEmergency();
  const router = useRouter();
  useRealtimeEmergency();

  const handleAccept = (emergency: Emergency) => {
    accept.mutate(emergency.id, {
      onSuccess: () => router.push({ pathname: '/emergency/[id]', params: { id: emergency.id } }),
    });
  };

  return (
    <Screen scrollable={false} padded={false}>
      <Header title="Emergency alerts" />
      {isLoading ? (
        <LoadingSpinner label="Loading alerts…" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EmergencyAlertCard
              emergency={item}
              loading={accept.isPending || decline.isPending}
              onAccept={() => handleAccept(item)}
              onDecline={() => decline.mutate({ id: item.id })}
              onDetails={() =>
                router.push({ pathname: '/emergency/[id]', params: { id: item.id } })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={isLoading}
          onRefresh={() => refetch()}
          ListEmptyComponent={
            <Card style={styles.empty}>
              <Text style={styles.emptyTitle}>All clear</Text>
              <Text style={styles.emptyBody}>
                No active emergencies nearby. You will receive a push
                notification if someone needs help.
              </Text>
            </Card>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  separator: { height: spacing.md },
  empty: { margin: spacing.lg, padding: spacing.xl, alignItems: 'center' },
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
});
