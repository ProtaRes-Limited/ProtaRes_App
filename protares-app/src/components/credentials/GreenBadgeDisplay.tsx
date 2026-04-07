import { useEffect, useState, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { TierBadge } from '@/components/ui/Badge';

interface GreenBadgeDisplayProps {
  name: string;
  tier: 1 | 2 | 3 | 4;
  qrValue: string;
  expiresAt: Date;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function GreenBadgeDisplay({
  name,
  tier,
  qrValue,
  expiresAt,
}: GreenBadgeDisplayProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  );
  const totalSeconds = useRef(
    Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  ).current;
  const progressAnim = useRef(
    new Animated.Value(secondsRemaining / totalSeconds),
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        return next;
      });
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: secondsRemaining * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, []);

  const isExpired = secondsRemaining <= 0;

  return (
    <View className="items-center rounded-2xl bg-white p-6 shadow-md">
      <View className="mb-3 flex-row items-center gap-2">
        <ShieldCheck size={28} color={isExpired ? '#9CA3AF' : '#16A34A'} />
        <Text className="text-xl font-bold text-gray-900">
          {isExpired ? 'Badge Expired' : 'Verified Responder'}
        </Text>
      </View>

      <Text className="mb-2 text-lg font-semibold text-gray-800">{name}</Text>

      <View className="mb-4">
        <TierBadge tier={tier} />
      </View>

      <View className="mb-4 rounded-xl bg-white p-4">
        <QRCode value={qrValue} size={180} />
      </View>

      <Text className="mb-2 text-sm text-gray-500">
        {isExpired ? 'This badge has expired' : 'Time remaining'}
      </Text>

      <Text
        className={`mb-3 text-2xl font-bold ${isExpired ? 'text-gray-400' : 'text-gray-900'}`}
      >
        {formatTimeRemaining(secondsRemaining)}
      </Text>

      <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <Animated.View
          className={`h-full rounded-full ${isExpired ? 'bg-gray-400' : 'bg-success-500'}`}
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    </View>
  );
}
