import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Settings, ShieldCheck, FileText, Lock, LayoutDashboard } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
import { signOut } from '@/services/auth';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, radii, spacing, typography } from '@/config/theme';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    Alert.alert('Sign out?', 'You will no longer receive emergency alerts.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            const mapped = mapError(err);
            captureException(err, { context: 'profile.signOut' });
            Alert.alert(mapped.title, mapped.message);
          }
        },
      },
    ]);
  };

  const menuItems: Array<{
    icon: React.ComponentType<{ size: number; color: string }>;
    title: string;
    subtitle: string;
    href: string;
  }> = [
    {
      icon: ShieldCheck,
      title: 'Credentials',
      subtitle: 'Verify GMC, NMC or HCPC',
      href: '/credentials',
    },
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'Notifications, radius, SMS fallback',
      href: '/settings',
    },
    {
      icon: Lock,
      title: 'Privacy & data',
      subtitle: 'Consent, data export, deletion',
      href: '/settings/privacy',
    },
    {
      icon: FileText,
      title: 'Response history',
      subtitle: 'View your past responses',
      href: '/(tabs)/history',
    },
  ];

  if (user.isAdmin) {
    menuItems.push({
      icon: LayoutDashboard,
      title: 'Admin panel',
      subtitle: 'Manage responders, emergencies & data',
      href: '/(admin)',
    });
  }

  return (
    <Screen scrollable padded={false}>
      <Header title="Profile" />
      <View style={styles.body}>
        <Card elevated style={styles.identityCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitials}>
              {user.firstName[0] ?? ''}
              {user.lastName[0] ?? ''}
            </Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.identityName}>{user.fullName || user.firstName}</Text>
            <Text style={styles.identityEmail}>{user.email}</Text>
          </View>
        </Card>

        <View style={styles.menu}>
          {menuItems.map(({ icon: Icon, title, subtitle, href }) => (
            <Card
              key={title}
              style={styles.menuItem}
              onTouchEnd={() => router.push(href as never)}
            >
              <Icon size={22} color={colors.nhsBlue} />
              <View style={styles.menuItemBody}>
                <Text style={styles.menuItemTitle}>{title}</Text>
                <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
              </View>
            </Card>
          ))}
        </View>

        <Button
          label="Sign out"
          variant="outline"
          onPress={handleSignOut}
          leftIcon={<LogOut size={18} color={colors.nhsBlue} />}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.nhsBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.h2,
    color: colors.white,
  },
  identityText: { flex: 1 },
  identityName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  identityEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menu: { gap: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
  },
  menuItemBody: { flex: 1 },
  menuItemTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
