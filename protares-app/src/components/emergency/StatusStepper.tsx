import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors, radii, spacing, typography } from '@/config/theme';
import type { EmergencyStatus } from '@/types';

const steps: Array<{ status: EmergencyStatus; label: string }> = [
  { status: 'dispatched', label: 'Dispatched' },
  { status: 'responder_en_route', label: 'En route' },
  { status: 'responder_on_scene', label: 'On scene' },
  { status: 'handover_complete', label: 'Handover' },
  { status: 'resolved', label: 'Resolved' },
];

const order: Record<string, number> = steps.reduce(
  (acc, step, idx) => ({ ...acc, [step.status]: idx }),
  {}
);

interface Props {
  currentStatus: EmergencyStatus;
}

export function StatusStepper({ currentStatus }: Props) {
  const currentIndex = order[currentStatus] ?? 0;

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <View key={step.status} style={styles.stepWrap}>
            <View
              style={[
                styles.dot,
                isDone && styles.dotDone,
                isCurrent && styles.dotCurrent,
              ]}
            >
              {isDone ? <Check size={12} color={colors.white} /> : null}
            </View>
            <Text
              style={[
                styles.label,
                (isDone || isCurrent) && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
            {idx < steps.length - 1 ? (
              <View style={[styles.bar, isDone && styles.barDone]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  stepWrap: { flex: 1, alignItems: 'center', flexDirection: 'column' },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.grey1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.successGreen },
  dotCurrent: {
    backgroundColor: colors.nhsBlue,
    borderWidth: 3,
    borderColor: colors.nhsLightBlue,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bar: {
    position: 'absolute',
    top: 12,
    left: '55%',
    right: '-45%',
    height: 2,
    backgroundColor: colors.grey1,
    borderRadius: radii.pill,
  },
  barDone: { backgroundColor: colors.successGreen },
});
