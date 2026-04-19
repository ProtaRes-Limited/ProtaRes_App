import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFeatureFlagStore } from '@/stores/featureFlags';
import { setFeatureFlag, type FeatureFlagKey } from '@/services/featureFlags';
import { captureException } from '@/lib/sentry';
import { colors, spacing, typography } from '@/config/theme';

/**
 * Admin feature flag control panel.
 *
 * Grouped by category; each flag shows its description, the configuration it
 * still needs (env vars, partner agreements), and a toggle. Realtime updates
 * flow through so another admin flipping a flag updates this screen too.
 */
export default function AdminFeatureFlags() {
  const flagsMap = useFeatureFlagStore((s) => s.flags);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const flags = useMemo(() => Object.values(flagsMap), [flagsMap]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof flags> = {};
    for (const f of flags) {
      (map[f.category] ??= []).push(f);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [flags]);

  const handleToggle = async (key: string, next: boolean, requires: string[]) => {
    if (next && requires.length > 0) {
      Alert.alert(
        'Confirm activation',
        `Before enabling, make sure these are configured in Supabase Secrets or partner agreements:\n\n${requires
          .map((r) => '• ' + r)
          .join('\n')}\n\nEnable anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'destructive',
            onPress: () => void applyToggle(key as FeatureFlagKey, next),
          },
        ]
      );
      return;
    }
    void applyToggle(key as FeatureFlagKey, next);
  };

  const applyToggle = async (key: FeatureFlagKey, next: boolean) => {
    setPendingKey(key);
    try {
      await setFeatureFlag(key, next);
    } catch (err) {
      captureException(err, { context: 'admin.featureFlags.toggle', key, next });
      Alert.alert(
        'Toggle failed',
        err instanceof Error ? err.message : 'Could not update flag. Check admin role.'
      );
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <Screen padded={false}>
      <Header title="Feature flags" subtitle="Admin · realtime" showBack />
      <ScrollView contentContainerStyle={styles.body}>
        {flags.length === 0 ? (
          <Text style={styles.empty}>
            Loading flags… if this persists, check Supabase connectivity.
          </Text>
        ) : null}

        {grouped.map(([category, categoryFlags]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.groupLabel}>{categoryLabel(category)}</Text>
            {categoryFlags.map((flag) => (
              <Card key={flag.key} style={styles.flagCard}>
                <View style={styles.flagRow}>
                  <View style={styles.flagInfo}>
                    <Text style={styles.flagKey}>{flag.key}</Text>
                    <Text style={styles.flagDescription}>{flag.description}</Text>
                    {flag.requiresConfiguration.length > 0 ? (
                      <View style={styles.requiresRow}>
                        <Text style={styles.requiresLabel}>Requires:</Text>
                        {flag.requiresConfiguration.map((r) => (
                          <Badge key={r} label={r} variant="warning" />
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <Switch
                    value={flag.enabled}
                    onValueChange={(next) =>
                      handleToggle(flag.key, next, flag.requiresConfiguration)
                    }
                    disabled={pendingKey === flag.key}
                    trackColor={{ true: colors.successGreen, false: colors.grey2 }}
                    thumbColor={colors.white}
                    accessibilityLabel={`Toggle ${flag.key}`}
                  />
                </View>
              </Card>
            ))}
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Turning a flag on while its prerequisites are not yet configured will surface a
          clean "not yet available" message to responders — no silent failures, no crashes.
          Safe to enable incrementally as integrations go live.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'emergency_services':
      return 'EMERGENCY SERVICES';
    case 'cad_integration':
      return 'CAD INTEGRATIONS';
    default:
      return category.toUpperCase();
  }
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.lg },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  group: { gap: spacing.sm },
  groupLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },

  flagCard: { padding: spacing.md },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  flagInfo: { flex: 1, gap: 4 },
  flagKey: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  flagDescription: { ...typography.bodySmall, color: colors.textSecondary },
  requiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  requiresLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
});
