import { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { TierBadge } from '@/components/ui/Badge';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '@/config/theme';

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
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export function GreenBadgeDisplay({ name, tier, qrValue, expiresAt }: GreenBadgeDisplayProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  );
  const totalSeconds = useRef(
    Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  ).current;
  const progressAnim = useRef(new Animated.Value(secondsRemaining / totalSeconds)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: secondsRemaining * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isExpired = secondsRemaining <= 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <ShieldCheck size={28} color={isExpired ? colors.gray[400] : colors.success[600]} />
        <Text style={styles.titleText}>{isExpired ? 'Badge Expired' : 'Verified Responder'}</Text>
      </View>

      <Text style={styles.name}>{name}</Text>

      <View style={styles.tierWrapper}>
        <TierBadge tier={tier} />
      </View>

      <View style={styles.qrWrapper}>
        <QRCode value={qrValue} size={180} />
      </View>

      <Text style={styles.label}>{isExpired ? 'This badge has expired' : 'Time remaining'}</Text>

      <Text style={[styles.countdown, isExpired && styles.expiredCountdown]}>
        {formatTimeRemaining(secondsRemaining)}
      </Text>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: isExpired ? colors.gray[400] : colors.success[500],
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    padding: spacing[6],
    ...shadows.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  titleText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  name: {
    marginBottom: spacing[2],
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[800],
  },
  tierWrapper: {
    marginBottom: spacing[4],
  },
  qrWrapper: {
    marginBottom: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    padding: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  countdown: {
    marginBottom: spacing[3],
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  expiredCountdown: {
    color: colors.gray[400],
  },
  progressBar: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
