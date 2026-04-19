import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/services/supabase';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/config/theme';

interface Metrics {
  totalResponders: number;
  activeNow: number;
  emergenciesToday: number;
  totalEmergencies: number;
  pendingCredentials: number;
  totalResponses: number;
}

const today = () => new Date().toISOString().split('T')[0]!;

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('responders').select('*', { count: 'exact', head: true }),
      supabase.from('responders').select('*', { count: 'exact', head: true }).eq('availability', 'available'),
      supabase.from('emergencies').select('*', { count: 'exact', head: true }).gte('created_at', today()),
      supabase.from('emergencies').select('*', { count: 'exact', head: true }),
      supabase.from('credentials').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('responses').select('*', { count: 'exact', head: true }),
    ]).then(([r, a, et, e, pc, tr]) => {
      setMetrics({
        totalResponders: r.count ?? 0,
        activeNow: a.count ?? 0,
        emergenciesToday: et.count ?? 0,
        totalEmergencies: e.count ?? 0,
        pendingCredentials: pc.count ?? 0,
        totalResponses: tr.count ?? 0,
      });
    });
  }, []);

  const sections = [
    { label: 'Responders', sub: metrics ? `${metrics.totalResponders} registered · ${metrics.activeNow} active` : '…', href: '/(admin)/responders', color: colors.nhsBlue },
    { label: 'Emergencies', sub: metrics ? `${metrics.emergenciesToday} today · ${metrics.totalEmergencies} total` : '…', href: '/(admin)/emergencies', color: colors.emergencyRed },
    { label: 'Responses', sub: metrics ? `${metrics.totalResponses} total` : '…', href: '/(admin)/responses', color: colors.successGreen },
    { label: 'Credentials', sub: metrics ? `${metrics.pendingCredentials} pending review` : '…', href: '/(admin)/credentials', color: metrics?.pendingCredentials ? colors.warningYellow : colors.successGreen },
    { label: 'Consent records', sub: 'UK GDPR Article 7 ledger', href: '/(admin)/consent', color: colors.nhsBlue },
    { label: 'Notification log', sub: 'Push · SMS · In-app', href: '/(admin)/notifications', color: colors.nhsBlue },
    { label: 'Audit log', sub: 'All system actions', href: '/(admin)/audit', color: colors.grey2 },
    { label: 'Feature flags', sub: 'Enable / disable pending integrations', href: '/(admin)/feature-flags', color: colors.nhsBlue },
  ];

  return (
    <Screen scrollable padded={false}>
      <Header title="Admin Panel" subtitle={`Signed in as ${user?.email}`} showBack />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {metrics && (
            <>
              <MetricBox label="Active responders" value={metrics.activeNow} color={colors.successGreen} />
              <MetricBox label="Today's emergencies" value={metrics.emergenciesToday} color={colors.emergencyRed} />
              <MetricBox label="Pending credentials" value={metrics.pendingCredentials} color={metrics.pendingCredentials ? colors.warningYellow : colors.successGreen} />
              <MetricBox label="Total responses" value={metrics.totalResponses} color={colors.nhsBlue} />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>MANAGE</Text>
        {sections.map(({ label, sub, href, color }) => (
          <TouchableOpacity key={label} onPress={() => router.push(href as never)} activeOpacity={0.8}>
            <Card elevated style={styles.sectionCard}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{label}</Text>
                <Text style={styles.sectionSub}>{sub}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
}

function MetricBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.metricBox, { borderLeftColor: color }]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  metricBox: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  metricValue: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  metricLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionLabel: { ...typography.caption, color: colors.grey3, fontWeight: '700', letterSpacing: 0.8, marginTop: spacing.sm },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionText: { flex: 1 },
  sectionTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  sectionSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 22, color: colors.grey3, fontWeight: '300' },
});
