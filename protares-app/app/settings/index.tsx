import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Volume2,
  Vibrate,
  Bell,
  Lock,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';

function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`w-12 h-7 rounded-full justify-center px-0.5 ${
        value ? 'bg-primary-500' : 'bg-gray-300'
      }`}
    >
      <View
        className={`w-6 h-6 rounded-full bg-white shadow ${
          value ? 'self-end' : 'self-start'
        }`}
      />
    </Pressable>
  );
}

interface SettingsNavItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
}

function SettingsNavItem({
  icon: Icon,
  label,
  description,
  onPress,
}: SettingsNavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <Icon size={20} color="#005EB8" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{label}</Text>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  return (
    <Screen safeArea padded={false}>
      <Header title="Settings" />
      <View className="flex-1 px-4">
        {/* Alert Preferences */}
        <Text className="text-lg font-bold text-gray-900 mt-4 mb-3">
          Alert Preferences
        </Text>

        <Card variant="outlined" className="mb-6">
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Volume2 size={20} color="#005EB8" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Sound
                </Text>
                <Text className="text-sm text-gray-500">
                  Play alert sounds for emergencies
                </Text>
              </View>
            </View>
            <Toggle
              value={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
            />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Vibrate size={20} color="#005EB8" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Vibration
                </Text>
                <Text className="text-sm text-gray-500">
                  Haptic feedback for alerts
                </Text>
              </View>
            </View>
            <Toggle
              value={vibrationEnabled}
              onToggle={() => setVibrationEnabled(!vibrationEnabled)}
            />
          </View>
        </Card>

        {/* Navigation Items */}
        <Text className="text-lg font-bold text-gray-900 mb-3">General</Text>

        <Card variant="outlined" className="mb-6">
          <SettingsNavItem
            icon={Bell}
            label="Notifications"
            description="Push notification and SMS preferences"
            onPress={() => {
              // Navigate to notifications settings
            }}
          />
          <SettingsNavItem
            icon={Lock}
            label="Privacy"
            description="Location tracking and data preferences"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsNavItem
            icon={Info}
            label="About"
            description="App version, legal information"
            onPress={() => {
              // Navigate to about screen
            }}
          />
        </Card>

        {/* App Info */}
        <View className="items-center mb-8">
          <Text className="text-xs text-gray-400">
            ProtaRes v1.0.0
          </Text>
          <Text className="text-xs text-gray-300 mt-1">
            Community Emergency Response Network
          </Text>
        </View>
      </View>
    </Screen>
  );
}
