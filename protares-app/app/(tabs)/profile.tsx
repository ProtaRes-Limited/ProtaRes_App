import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
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
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

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
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: colors.gray[50] },
      ]}
    >
      <View
        style={[
          styles.menuIconCircle,
          danger ? styles.menuIconDanger : styles.menuIconDefault,
        ]}
      >
        <Icon size={20} color={danger ? '#DA291C' : '#005EB8'} />
      </View>
      <View style={styles.menuTextBlock}>
        <Text
          style={[
            styles.menuLabel,
            danger ? styles.menuLabelDanger : styles.menuLabelDefault,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.menuDescription}>{description}</Text>
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
      <View style={styles.profileHeader}>
        <Avatar
          name={user?.fullName}
          source={user?.profilePhotoUrl ?? undefined}
          size="xl"
          online={user?.availability === 'available'}
        />
        <Text style={styles.profileName}>
          {user?.fullName || 'Responder'}
        </Text>
        <Text style={styles.profileEmail}>
          {user?.email}
        </Text>
        <View style={styles.tierBadgeWrapper}>
          <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
        </View>
      </View>

      {/* Menu Items */}
      <Card variant="outlined" style={styles.menuCard}>
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
      <View style={styles.signOutWrapper}>
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

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: colors.emergency[100],
  },
  menuIconDefault: {
    backgroundColor: colors.gray[100],
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  menuLabelDanger: {
    color: colors.emergency[600],
  },
  menuLabelDefault: {
    color: colors.gray[900],
  },
  menuDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing[3],
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  tierBadgeWrapper: {
    marginTop: spacing[3],
  },
  menuCard: {
    marginBottom: spacing[4],
  },
  signOutWrapper: {
    marginBottom: spacing[8],
  },
});
