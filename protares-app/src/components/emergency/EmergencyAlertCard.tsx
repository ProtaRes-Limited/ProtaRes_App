import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { AlertTriangle, MapPin, Clock, Users, Ambulance } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface EmergencyAlertCardProps {
  type: string;
  location: string;
  eta?: string;
  casualtyCount?: number;
  ambulanceEta?: string;
  countdownSeconds?: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function EmergencyAlertCard({
  type,
  location,
  eta,
  casualtyCount,
  ambulanceEta,
  countdownSeconds = 60,
  onAccept,
  onDecline,
}: EmergencyAlertCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: countdownSeconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="emergency">
      <View className="mb-3 flex-row items-center gap-2">
        <AlertTriangle size={24} color="#DC2626" />
        <Text className="flex-1 text-lg font-bold text-emergency-600">
          {type}
        </Text>
        <Text className="text-sm font-semibold text-emergency-500">
          {secondsLeft}s
        </Text>
      </View>

      <View className="mb-3 gap-2">
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color="#6B7280" />
          <Text className="flex-1 text-sm text-gray-700">{location}</Text>
        </View>

        {eta && (
          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-700">ETA: {eta}</Text>
          </View>
        )}

        {casualtyCount !== undefined && (
          <View className="flex-row items-center gap-2">
            <Users size={16} color="#6B7280" />
            <Text className="text-sm text-gray-700">
              {casualtyCount} {casualtyCount === 1 ? 'casualty' : 'casualties'}
            </Text>
          </View>
        )}

        {ambulanceEta && (
          <View className="flex-row items-center gap-2">
            <Ambulance size={16} color="#6B7280" />
            <Text className="text-sm text-gray-700">
              Ambulance ETA: {ambulanceEta}
            </Text>
          </View>
        )}
      </View>

      <View className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
        <Animated.View
          className="h-full rounded-full bg-emergency-500"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button variant="danger" fullWidth onPress={onDecline}>
            Decline
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="success" fullWidth onPress={onAccept}>
            Accept
          </Button>
        </View>
      </View>
    </Card>
  );
}
