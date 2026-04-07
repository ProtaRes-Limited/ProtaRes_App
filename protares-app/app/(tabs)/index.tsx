import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, TierBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmergencyAlertCard } from '@/components/emergency/EmergencyAlertCard';
import { useAuthStore } from '@/stores/auth';
import { useEmergencyStore } from '@/stores/emergency';
import { TIER_LABELS, EMERGENCY_TYPE_LABELS } from '@/lib/constants';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const pendingAlerts = useEmergencyStore((s) => s.pendingAlerts);
  const removePendingAlert = useEmergencyStore((s) => s.removePendingAlert);
  const [isAvailable, setIsAvailable] = useState(
    user?.availability === 'available'
  );

  const firstName = user?.firstName || 'Responder';
  const tierNumber = user?.tier === 'tier1_active_healthcare'
    ? 1
    : user?.tier === 'tier2_retired_healthcare'
    ? 2
    : user?.tier === 'tier3_first_aid'
    ? 3
    : 4;

  const avgResponseTime = user?.averageResponseTimeSeconds
    ? `${Math.round(user.averageResponseTimeSeconds / 60)}m`
    : '--';

  const handleAcceptAlert = (id: string) => {
    removePendingAlert(id);
    router.push(`/emergency/${id}`);
  };

  const handleDeclineAlert = (id: string) => {
    removePendingAlert(id);
  };

  return (
    <Screen scroll>
      {/* Greeting */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Good morning,</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {firstName}
          </Text>
        </View>
        <Avatar
          name={user?.fullName}
          source={user?.profilePhotoUrl ?? undefined}
          size="lg"
          online={isAvailable}
        />
      </View>

      {/* Pending Alerts */}
      {pendingAlerts.map((alert) => (
        <View key={alert.id} className="mb-4">
          <EmergencyAlertCard
            type={EMERGENCY_TYPE_LABELS[alert.emergencyType]}
            location={alert.locationAddress || 'Unknown location'}
            eta={alert.etaMinutes ? `${alert.etaMinutes} min` : undefined}
            casualtyCount={alert.casualtyCount}
            ambulanceEta={
              alert.ambulanceEtaMinutes
                ? `${alert.ambulanceEtaMinutes} min`
                : undefined
            }
            onAccept={() => handleAcceptAlert(alert.id)}
            onDecline={() => handleDeclineAlert(alert.id)}
          />
        </View>
      ))}

      {/* Availability Status */}
      <Card variant={isAvailable ? 'active' : 'outlined'} className="mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isAvailable ? 'bg-success-100' : 'bg-gray-100'
              }`}
            >
              <Activity
                size={20}
                color={isAvailable ? '#009639' : '#9CA3AF'}
              />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900">
                {isAvailable ? 'Available' : 'Off Duty'}
              </Text>
              <Text className="text-sm text-gray-500">
                {isAvailable
                  ? 'You will receive emergency alerts'
                  : 'You will not receive alerts'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIsAvailable(!isAvailable)}
            className={`w-14 h-8 rounded-full justify-center px-1 ${
              isAvailable ? 'bg-success-500' : 'bg-gray-300'
            }`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-white shadow ${
                isAvailable ? 'self-end' : 'self-start'
              }`}
            />
          </Pressable>
        </View>
      </Card>

      {/* Quick Stats */}
      <View className="flex-row gap-3 mb-4">
        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary-500">
              {user?.totalResponses ?? 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Responses</Text>
          </View>
        </Card>

        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <Text className="text-2xl font-bold text-success-500">
              {user?.totalAccepted ?? 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Accepted</Text>
          </View>
        </Card>

        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <Text className="text-2xl font-bold text-warning-500">
              {avgResponseTime}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Avg Time</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Quick Actions
      </Text>

      <View className="gap-3 mb-4">
        <Card
          variant="emergency"
          onPress={() => router.push('/emergency/report')}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-emergency-100 items-center justify-center">
              <AlertTriangle size={24} color="#DA291C" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-emergency-600">
                Report Emergency
              </Text>
              <Text className="text-sm text-gray-500">
                Report a nearby emergency as a witness
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </Card>

        <Card
          variant="outlined"
          onPress={() => router.push('/credentials/green-badge')}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-success-100 items-center justify-center">
              <CreditCard size={24} color="#009639" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Green Badge
              </Text>
              <Text className="text-sm text-gray-500">
                Show your verified responder badge
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </Card>

        <Card
          variant="outlined"
          onPress={() => router.push('/(tabs)/alerts')}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <Bell size={24} color="#005EB8" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                View Alerts
              </Text>
              <Text className="text-sm text-gray-500">
                See all active and past emergency alerts
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </Card>
      </View>

      {/* Credentials */}
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Your Credentials
      </Text>
      <Card variant="outlined" className="mb-8">
        <View className="flex-row items-center gap-3 mb-3">
          <Shield size={24} color="#005EB8" />
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {user?.fullName}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}
            </Text>
          </View>
        </View>
        <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
      </Card>
    </Screen>
  );
}
