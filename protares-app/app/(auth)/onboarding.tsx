import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, MapPin, Bell } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/config/theme';

const highlights = [
  {
    icon: Shield,
    title: 'Verified responders only',
    body: 'GMC / NMC / HCPC credentials are verified before you respond to patients.',
  },
  {
    icon: MapPin,
    title: 'You choose your radius',
    body: 'Set where and when you are available. Location tracking is opt-in.',
  },
  {
    icon: Bell,
    title: 'Every second matters',
    body: 'Push alerts when someone nearby needs help, with a direct link to 999.',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome to ProtaRes</Text>
        <Text style={styles.subtitle}>
          An NHS-aligned emergency response network for verified healthcare
          professionals and trained first aiders.
        </Text>
      </View>

      <View style={styles.list}>
        {highlights.map(({ icon: Icon, title, body }) => (
          <View key={title} style={styles.item}>
            <View style={styles.iconWrap}>
              <Icon size={22} color={colors.nhsBlue} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemDescription}>{body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label="Get started"
          onPress={() => router.replace('/(auth)/register')}
          size="lg"
          fullWidth
        />
        <Button
          label="I already have an account"
          onPress={() => router.replace('/(auth)/login')}
          variant="ghost"
          size="md"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: spacing.xxxl, marginBottom: spacing.xl },
  title: {
    ...typography.display,
    color: colors.nhsBlue,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  list: { marginTop: spacing.lg, marginBottom: spacing.xxl },
  item: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1EEFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  itemBody: { flex: 1 },
  itemTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footer: { gap: spacing.sm },
});
