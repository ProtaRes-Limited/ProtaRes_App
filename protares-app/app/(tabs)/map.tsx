import { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Clock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import { EMERGENCY_TYPE_LABELS } from '@/lib/constants';

export default function MapScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const userLocation = user?.currentLocation;

  return (
    <Screen padded={false} safeArea>
      <View className="flex-1">
        {/* Map Placeholder */}
        <View className="flex-1 bg-gray-200 items-center justify-center">
          <View className="items-center px-8">
            <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-4">
              <MapPin size={32} color="#005EB8" />
            </View>
            <Text className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Map View
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Interactive map will display here with your location and nearby emergencies.
            </Text>
            {userLocation && (
              <View className="mt-4 flex-row items-center gap-2 bg-white rounded-full px-4 py-2">
                <Navigation size={14} color="#005EB8" />
                <Text className="text-xs text-gray-600">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Panel */}
        <View className="bg-white border-t border-gray-200 rounded-t-2xl">
          {/* Handle */}
          <Pressable
            onPress={() => setPanelExpanded(!panelExpanded)}
            className="items-center py-3"
          >
            <View className="w-10 h-1 rounded-full bg-gray-300 mb-2" />
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-gray-700">
                Nearby Emergencies ({pendingAlerts.length})
              </Text>
              {panelExpanded ? (
                <ChevronDown size={16} color="#6B7280" />
              ) : (
                <ChevronUp size={16} color="#6B7280" />
              )}
            </View>
          </Pressable>

          {/* Panel Content */}
          <View
            className={`px-4 pb-4 ${
              panelExpanded ? 'max-h-80' : 'max-h-36'
            }`}
          >
            {pendingAlerts.length === 0 ? (
              <View className="py-4 items-center">
                <Text className="text-sm text-gray-500">
                  No emergencies nearby
                </Text>
              </View>
            ) : (
              pendingAlerts.slice(0, panelExpanded ? 10 : 2).map((alert) => (
                <Card
                  key={alert.id}
                  variant="outlined"
                  className="mb-2"
                  onPress={() => router.push(`/emergency/${alert.id}`)}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-emergency-100 items-center justify-center">
                      <AlertTriangle size={16} color="#DA291C" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-gray-900"
                        numberOfLines={1}
                      >
                        {EMERGENCY_TYPE_LABELS[alert.emergencyType]}
                      </Text>
                      <Text
                        className="text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {alert.locationAddress || 'Unknown location'}
                      </Text>
                    </View>
                    {alert.distanceMeters != null && (
                      <Badge variant="info">
                        {alert.distanceMeters < 1000
                          ? `${alert.distanceMeters}m`
                          : `${(alert.distanceMeters / 1000).toFixed(1)}km`}
                      </Badge>
                    )}
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}
