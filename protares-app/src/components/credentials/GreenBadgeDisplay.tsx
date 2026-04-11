import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { fetchGreenBadge } from '@/services/credentials';
import { colors, radii, shadows, spacing, typography } from '@/config/theme';
import { GREEN_BADGE_REFRESH_SECONDS } from '@/lib/constants';
import { captureException } from '@/lib/sentry';
import type { GreenBadge } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Displays the signed Green Badge QR, regenerating it every 60 seconds.
 * The badge can only be issued after credentials are verified. EMS teams
 * scan the QR with their own device to confirm the responder's tier
 * and the signature's freshness — this is the patent-pending mechanism
 * the master doc references in §14.
 */
export function GreenBadgeDisplay({ holderName, tier }: { holderName: string; tier: string }) {
  const [badge, setBadge] = useState<GreenBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [ttl, setTtl] = useState(GREEN_BADGE_REFRESH_SECONDS);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      setLoading(true);
      try {
        const data = await fetchGreenBadge();
        if (cancelled) return;
        setBadge(data);
        setTtl(GREEN_BADGE_REFRESH_SECONDS);
      } catch (err) {
        captureException(err, { context: 'fetchGreenBadge' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    const refreshTimer = setInterval(refresh, GREEN_BADGE_REFRESH_SECONDS * 1000);
    const tickTimer = setInterval(() => {
      setTtl((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, []);

  if (loading && !badge) {
    return <LoadingSpinner label="Generating secure badge…" />;
  }

  if (!badge) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          Green Badge is temporarily unavailable. Try again in a moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} accessible accessibilityRole="image">
      <View style={styles.header}>
        <Text style={styles.label}>GREEN BADGE</Text>
        <Text style={styles.holder}>{holderName}</Text>
        <Text style={styles.tier}>{tier}</Text>
      </View>

      <View style={styles.qrWrap}>
        <QRCode
          value={badge.signedPayload}
          size={220}
          backgroundColor={colors.white}
          color={colors.nhsDarkBlue}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.ttl}>Refreshes in {ttl}s</Text>
        <Text style={styles.nonce}>
          Nonce · {badge.nonce.slice(0, 8).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.successGreen,
    ...shadows.lg,
  },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  label: {
    ...typography.caption,
    color: colors.successGreen,
    fontWeight: '800',
    letterSpacing: 2,
  },
  holder: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tier: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  qrWrap: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  ttl: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nonce: {
    ...typography.caption,
    color: colors.grey3,
    fontFamily: 'monospace',
  },
  errorBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
