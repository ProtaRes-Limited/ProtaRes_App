import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Clock, MapPin, Users } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDistance, formatEta } from '@/lib/distance';
import { RESPONDER_ACCEPT_TIMEOUT_SECONDS } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/config/theme';
import type { Emergency } from '@/types';

interface Props {
  emergency: Emergency;
  onAccept: () => void;
  onDecline: () => void;
  onDetails?: () => void;
  loading?: boolean;
}

const severityVariant: Record<Emergency['severity'], 'emergency' | 'critical' | 'warning' | 'info'> = {
  critical: 'emergency',
  serious: 'critical',
  moderate: 'warning',
  minor: 'info',
};

const typeLabels: Record<string, string> = {
  cardiac_arrest: 'Cardiac arrest',
  heart_attack: 'Heart attack',
  road_accident: 'Road accident',
  pedestrian_incident: 'Pedestrian incident',
  cyclist_incident: 'Cyclist incident',
  stroke: 'Stroke',
  diabetic_emergency: 'Diabetic emergency',
  anaphylaxis: 'Anaphylaxis',
  seizure: 'Seizure',
  breathing_difficulty: 'Breathing difficulty',
  stabbing: 'Stabbing',
  assault: 'Assault',
  serious_fall: 'Serious fall',
  choking: 'Choking',
  drowning: 'Drowning',
  burn: 'Burn',
  electrocution: 'Electrocution',
  overdose: 'Overdose',
  other_medical: 'Medical emergency',
  other_trauma: 'Trauma',
};

/**
 * The EmergencyAlertCard is the most consequential UI component in the
 * app. It must be instantly legible under stress, show the countdown
 * until the emergency is reassigned to the next responder, and offer
 * unambiguous Accept / Decline actions.
 */
export function EmergencyAlertCard({
  emergency,
  onAccept,
  onDecline,
  onDetails,
  loading = false,
}: Props) {
  const [remaining, setRemaining] = useState(RESPONDER_ACCEPT_TIMEOUT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [emergency.id]);

  const typeLabel = typeLabels[emergency.emergencyType] ?? 'Emergency';

  return (
    <Card elevated style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.typeRow}>
          <AlertTriangle size={22} color={colors.emergencyRed} />
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        <Badge
          label={emergency.severity.toUpperCase()}
          variant={severityVariant[emergency.severity]}
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {emergency.distanceMeters != null
              ? formatDistance(emergency.distanceMeters)
              : 'Distance unknown'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {emergency.etaMinutes != null
              ? `${emergency.etaMinutes} min ETA`
              : emergency.distanceMeters != null
                ? formatEta(Math.round(emergency.distanceMeters / 1.4))
                : '—'}
          </Text>
        </View>
        {emergency.casualtyCount > 0 ? (
          <View style={styles.metaItem}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{emergency.casualtyCount} casualty</Text>
          </View>
        ) : null}
      </View>

      {emergency.locationAddress || emergency.locationDescription ? (
        <View style={styles.locationBlock}>
          <Text style={styles.locationText} numberOfLines={2}>
            {emergency.locationAddress ?? emergency.locationDescription}
          </Text>
        </View>
      ) : null}

      <View style={styles.countdownWrap} accessibilityLiveRegion="polite">
        <View style={styles.countdownBar}>
          <View
            style={[
              styles.countdownFill,
              { width: `${(remaining / RESPONDER_ACCEPT_TIMEOUT_SECONDS) * 100}%` },
              remaining < 15 && styles.countdownFillUrgent,
            ]}
          />
        </View>
        <Text style={[styles.countdownText, remaining < 15 && styles.countdownTextUrgent]}>
          {remaining}s to respond
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Accept"
          variant="emergency"
          size="emergency"
          onPress={onAccept}
          loading={loading}
          accessibilityLabel={`Accept ${typeLabel} emergency`}
          fullWidth
        />
        <View style={styles.actionRow}>
          <View style={styles.secondaryAction}>
            <Button label="Decline" variant="outline" size="md" onPress={onDecline} fullWidth />
          </View>
          {onDetails ? (
            <View style={styles.secondaryAction}>
              <Button label="Details" variant="ghost" size="md" onPress={onDetails} fullWidth />
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderLeftWidth: 6,
    borderLeftColor: colors.emergencyRed,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  typeText: {
    ...typography.h3,
    color: colors.emergencyRed,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  locationBlock: {
    backgroundColor: colors.paleGrey,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  countdownWrap: { marginTop: spacing.sm },
  countdownBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grey1,
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    backgroundColor: colors.successGreen,
  },
  countdownFillUrgent: {
    backgroundColor: colors.emergencyRed,
  },
  countdownText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  countdownTextUrgent: {
    color: colors.emergencyRed,
    fontWeight: '700',
  },
  actions: { gap: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryAction: { flex: 1 },
});
