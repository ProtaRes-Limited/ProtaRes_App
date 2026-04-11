import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth';
import { colors, spacing, typography } from '@/config/theme';

interface HistoryEntry {
  id: string;
  emergency_id: string;
  status: string;
  accepted_at: string | null;
  arrived_at: string | null;
  handover_at: string | null;
  emergencies: {
    emergency_type: string;
    severity: string;
    location_address: string | null;
    created_at: string;
  } | null;
}

export default function HistoryScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);

  const { data, isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['history', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('responses')
        .select(
          'id, emergency_id, status, accepted_at, arrived_at, handover_at, emergencies(emergency_type, severity, location_address, created_at)'
        )
        .eq('responder_id', userId!)
        .order('accepted_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (rows as unknown as HistoryEntry[]) ?? [];
    },
  });

  return (
    <Screen padded={false}>
      <Header title="Response history" />
      {isLoading ? (
        <LoadingSpinner label="Loading history…" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card elevated style={styles.entry}>
              <View style={styles.rowBetween}>
                <Text style={styles.title} numberOfLines={1}>
                  {(item.emergencies?.emergency_type ?? 'Emergency').replace(/_/g, ' ')}
                </Text>
                <Badge
                  label={(item.emergencies?.severity ?? 'moderate').toUpperCase()}
                  variant={item.emergencies?.severity === 'critical' ? 'emergency' : 'info'}
                />
              </View>
              {item.emergencies?.location_address ? (
                <Text style={styles.subtitle}>{item.emergencies.location_address}</Text>
              ) : null}
              {item.accepted_at ? (
                <Text style={styles.timestamp}>
                  Accepted {format(new Date(item.accepted_at), 'PP · HH:mm')}
                </Text>
              ) : null}
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <Card style={styles.empty}>
              <Text style={styles.emptyTitle}>No responses yet</Text>
              <Text style={styles.emptyBody}>
                Your response history will appear here once you accept an
                emergency.
              </Text>
            </Card>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, flexGrow: 1 },
  entry: { padding: spacing.lg, gap: spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  empty: { padding: spacing.xl, alignItems: 'center' },
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
