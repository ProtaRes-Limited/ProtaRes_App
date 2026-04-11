import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { GreenBadgeDisplay } from '@/components/credentials/GreenBadgeDisplay';
import { useAuthStore } from '@/stores/auth';
import { colors, spacing, typography } from '@/config/theme';

const tierDisplay: Record<string, string> = {
  tier1_active_healthcare: 'Active Healthcare Responder',
  tier2_retired_healthcare: 'Retired Healthcare Responder',
  tier3_first_aid: 'Trained First Aider',
  tier4_witness: 'Witness Responder',
};

export default function GreenBadgeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <Screen padded={false}>
      <Header title="Green Badge" showBack />
      <View style={styles.body}>
        <Text style={styles.description}>
          Show this badge to arriving EMS. It refreshes automatically to prevent
          screenshots being reused.
        </Text>

        {user ? (
          <GreenBadgeDisplay
            holderName={user.fullName || `${user.firstName} ${user.lastName}`.trim()}
            tier={tierDisplay[user.tier] ?? 'Responder'}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xl,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
