import { View, Text } from 'react-native';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth';

export default function HistoryScreen() {
  const user = useAuthStore((s) => s.user);

  const totalResponses = user?.totalResponses ?? 0;
  const totalAccepted = user?.totalAccepted ?? 0;
  const totalDeclined = user?.totalDeclined ?? 0;
  const avgTime = user?.averageResponseTimeSeconds
    ? `${Math.round(user.averageResponseTimeSeconds / 60)}m ${
        user.averageResponseTimeSeconds % 60
      }s`
    : '--';

  return (
    <Screen scroll>
      {/* Header */}
      <View className="mt-4 mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          Response History
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Your emergency response activity
        </Text>
      </View>

      {/* Stats Summary */}
      <View className="flex-row gap-3 mb-6">
        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mb-2">
              <Clock size={20} color="#005EB8" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {totalResponses}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Total
            </Text>
          </View>
        </Card>

        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <View className="w-10 h-10 rounded-full bg-success-100 items-center justify-center mb-2">
              <CheckCircle size={20} color="#009639" />
            </View>
            <Text className="text-xl font-bold text-success-600">
              {totalAccepted}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Accepted
            </Text>
          </View>
        </Card>

        <Card variant="elevated" className="flex-1">
          <View className="items-center">
            <View className="w-10 h-10 rounded-full bg-warning-100 items-center justify-center mb-2">
              <Timer size={20} color="#F59E0B" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {avgTime}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Avg Time
            </Text>
          </View>
        </Card>
      </View>

      {/* Declined stat */}
      <Card variant="outlined" className="mb-6">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-emergency-100 items-center justify-center">
            <XCircle size={20} color="#DA291C" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Declined
            </Text>
            <Text className="text-sm text-gray-500">
              Alerts you could not respond to
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {totalDeclined}
          </Text>
        </View>
      </Card>

      {/* Response List or Empty */}
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Recent Responses
      </Text>

      <EmptyState
        icon={Clock}
        title="No Responses Yet"
        description="Your emergency response history will appear here once you accept and respond to alerts."
      />
    </Screen>
  );
}
