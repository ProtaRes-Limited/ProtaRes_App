import { useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
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
      className="mb-3"
      onPress={() => router.push(`/emergency/${item.id}`)}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-full bg-emergency-100 items-center justify-center mt-0.5">
          <AlertTriangle size={20} color="#DA291C" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-semibold text-gray-900">
              {EMERGENCY_TYPE_LABELS[item.emergencyType]}
            </Text>
            <Badge variant={SEVERITY_VARIANT[item.severity] ?? 'default'}>
              {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
            </Badge>
          </View>

          <View className="flex-row items-center gap-1.5 mb-1">
            <MapPin size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
              {item.locationAddress || 'Unknown location'}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500">
              {formatTimeAgo(item.createdAt)}
            </Text>
            {item.distanceMeters != null && (
              <>
                <Text className="text-xs text-gray-400 mx-1">|</Text>
                <Text className="text-xs text-gray-500">
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
      <View className="flex-row items-center justify-between mt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900">Alerts</Text>
        <View className="flex-row items-center gap-1">
          <Filter size={16} color="#6B7280" />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row gap-2 mb-4">
        <Pressable
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-full ${
            filter === 'all'
              ? 'bg-primary-500'
              : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              filter === 'all' ? 'text-white' : 'text-gray-600'
            }`}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter('active')}
          className={`px-4 py-2 rounded-full ${
            filter === 'active'
              ? 'bg-primary-500'
              : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              filter === 'active' ? 'text-white' : 'text-gray-600'
            }`}
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
