import { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';
import type { Emergency } from '@/types';

type FilterTab = 'all' | 'active';

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error',
  serious: 'warning',
  moderate: 'info',
  minor: 'default',
};

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AlertsScreen() {
  const router = useRouter();
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const [filter, setFilter] = useState<FilterTab>('all');

  const activeStatuses = [
    'reported',
    'dispatched',
    'responder_en_route',
    'responder_on_scene',
    'ems_en_route',
    'ems_on_scene',
  ];

  const filteredAlerts =
    filter === 'active'
      ? pendingAlerts.filter((a) => activeStatuses.includes(a.status))
      : pendingAlerts;

  const renderAlert = ({ item }: { item: Emergency }) => (
    <Card
      variant="outlined"
      style={styles.alertCard}
      onPress={() => router.push(`/emergency/${item.id}`)}
    >
      <View style={styles.alertRow}>
        <View style={styles.alertIconCircle}>
          <AlertTriangle size={20} color="#DA291C" />
        </View>

        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>
              {EMERGENCY_TYPE_LABELS[item.emergencyType]}
            </Text>
            <Badge variant={SEVERITY_VARIANT[item.severity] ?? 'default'}>
              {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
            </Badge>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.locationAddress || 'Unknown location'}
            </Text>
          </View>

          <View style={styles.metaRowCompact}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {formatTimeAgo(item.createdAt)}
            </Text>
            {item.distanceMeters != null && (
              <>
                <Text style={styles.metaSeparator}>|</Text>
                <Text style={styles.metaText}>
                  {item.distanceMeters < 1000
                    ? `${item.distanceMeters}m away`
                    : `${(item.distanceMeters / 1000).toFixed(1)}km away`}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.headerIconRow}>
          <Filter size={16} color="#6B7280" />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[
            styles.filterTab,
            filter === 'all' ? styles.filterTabActive : styles.filterTabInactive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all'
                ? styles.filterTabTextActive
                : styles.filterTabTextInactive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter('active')}
          style={[
            styles.filterTab,
            filter === 'active' ? styles.filterTabActive : styles.filterTabInactive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active'
                ? styles.filterTabTextActive
                : styles.filterTabTextInactive,
            ]}
          >
            Active
          </Text>
        </Pressable>
      </View>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Alerts"
          description="You have no emergency alerts at this time. Stay ready — alerts will appear here when nearby emergencies are reported."
        />
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  filterTab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
  },
  filterTabInactive: {
    backgroundColor: colors.gray[100],
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  filterTabTextInactive: {
    color: colors.gray[600],
  },
  alertCard: {
    marginBottom: spacing[3],
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.emergency[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[0.5],
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  alertTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[1],
  },
  metaRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    flex: 1,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  metaSeparator: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
    marginHorizontal: spacing[1],
  },
});
