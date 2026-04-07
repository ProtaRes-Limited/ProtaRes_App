import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CreditCard,
  ShieldCheck,
  Bell,
  Lock,
  Settings,
  Download,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
import { TIER_LABELS } from '@/lib/constants';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, description, onPress, danger }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${
          danger ? 'bg-emergency-100' : 'bg-gray-100'
        }`}
      >
        <Icon size={20} color={danger ? '#DA291C' : '#005EB8'} />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${
            danger ? 'text-emergency-600' : 'text-gray-900'
          }`}
        >
          {label}
        </Text>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const tierNumber = user?.tier === 'tier1_active_healthcare'
    ? 1
    : user?.tier === 'tier2_retired_healthcare'
    ? 2
    : user?.tier === 'tier3_first_aid'
    ? 3
    : 4;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      {/* Profile Header */}
      <View className="items-center mt-6 mb-6">
        <Avatar
          name={user?.fullName}
          source={user?.profilePhotoUrl ?? undefined}
          size="xl"
          online={user?.availability === 'available'}
        />
        <Text className="text-xl font-bold text-gray-900 mt-3">
          {user?.fullName || 'Responder'}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {user?.email}
        </Text>
        <View className="mt-3">
          <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
        </View>
      </View>

      {/* Menu Items */}
      <Card variant="outlined" className="mb-4">
        <MenuItem
          icon={CreditCard}
          label="Green Badge"
          description="Display your verified responder badge"
          onPress={() => router.push('/credentials/green-badge')}
        />
        <MenuItem
          icon={ShieldCheck}
          label="Verify Credentials"
          description="Verify your professional qualifications"
          onPress={() => router.push('/credentials')}
        />
        <MenuItem
          icon={Bell}
          label="Notifications"
          description="Manage alert and notification settings"
          onPress={() => router.push('/settings')}
        />
        <MenuItem
          icon={Lock}
          label="Privacy"
          description="Location tracking and data preferences"
          onPress={() => router.push('/settings/privacy')}
        />
        <MenuItem
          icon={Settings}
          label="Settings"
          description="App preferences and configuration"
          onPress={() => router.push('/settings')}
        />
        <MenuItem
          icon={Download}
          label="Download Data"
          description="Export your response history and data"
          onPress={() =>
            Alert.alert(
              'Download Data',
              'Your data export will be prepared and emailed to you.'
            )
          }
        />
      </Card>

      {/* Sign Out */}
      <View className="mb-8">
        <Button
          variant="ghost"
          fullWidth
          icon={LogOut}
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </View>
    </Screen>
  );
}
