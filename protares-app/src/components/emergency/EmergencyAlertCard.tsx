import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { AlertTriangle, MapPin, Clock, Users, Ambulance } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

interface EmergencyAlertCardProps {
  type: string;
  location: string;
  eta?: string;
  casualtyCount?: number;
  ambulanceEta?: string;
  countdownSeconds?: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function EmergencyAlertCard({
  type,
  location,
  eta,
  casualtyCount,
  ambulanceEta,
  countdownSeconds = 60,
  onAccept,
  onDecline,
}: EmergencyAlertCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: countdownSeconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card variant="emergency">
      <View style={styles.header}>
        <AlertTriangle size={24} color={colors.emergency[600]} />
        <Text style={styles.title}>{type}</Text>
        <Text style={styles.countdown}>{secondsLeft}s</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <MapPin size={16} color={colors.gray[500]} />
          <Text style={styles.rowText}>{location}</Text>
        </View>
        {eta && (
          <View style={styles.row}>
            <Clock size={16} color={colors.gray[500]} />
            <Text style={styles.rowText}>ETA: {eta}</Text>
          </View>
        )}
        {casualtyCount !== undefined && (
          <View style={styles.row}>
            <Users size={16} color={colors.gray[500]} />
            <Text style={styles.rowText}>
              {casualtyCount} {casualtyCount === 1 ? 'casualty' : 'casualties'}
            </Text>
          </View>
        )}
        {ambulanceEta && (
          <View style={styles.row}>
            <Ambulance size={16} color={colors.gray[500]} />
            <Text style={styles.rowText}>Ambulance ETA: {ambulanceEta}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <Button variant="danger" fullWidth onPress={onDecline}>
            Decline
          </Button>
        </View>
        <View style={styles.buttonWrapper}>
          <Button variant="success" fullWidth onPress={onAccept}>
            Accept
          </Button>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.emergency[600],
  },
  countdown: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emergency[500],
  },
  details: {
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rowText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray[700],
  },
  progressBar: {
    height: 8,
    marginBottom: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.emergency[500],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  buttonWrapper: {
    flex: 1,
  },
});
