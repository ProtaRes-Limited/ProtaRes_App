import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/config/theme';

type StepStatus = 'completed' | 'active' | 'pending';

const STEPS = ['Accepted', 'En Route', 'On Scene', 'Handover', 'Complete'] as const;

type Step = (typeof STEPS)[number];

interface StatusStepperProps {
  currentStep: Step;
}

function getStepStatus(stepIndex: number, currentIndex: number): StepStatus {
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

function getCircleColor(status: StepStatus): string {
  if (status === 'completed') return colors.success[500];
  if (status === 'active') return colors.primary[500];
  return colors.gray[300];
}

function getLabelColor(status: StepStatus): string {
  if (status === 'completed') return colors.success[600];
  if (status === 'active') return colors.primary[600];
  return colors.gray[400];
}

export function StatusStepper({ currentStep }: StatusStepperProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const status = getStepStatus(index, currentIndex);
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step} style={styles.stepWrapper}>
            <View style={styles.stepColumn}>
              <View style={[styles.circle, { backgroundColor: getCircleColor(status) }]}>
                {status === 'completed' ? (
                  <Check size={14} color={colors.white} />
                ) : (
                  <Text style={[styles.circleText, status === 'active' && styles.activeCircleText]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: getLabelColor(status) },
                  (status === 'completed' || status === 'active') && styles.labelBold,
                ]}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
            {!isLast && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: index < currentIndex ? colors.success[500] : colors.gray[300] },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepColumn: {
    alignItems: 'center',
  },
  circle: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  circleText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gray[500],
  },
  activeCircleText: {
    color: colors.white,
  },
  label: {
    marginTop: spacing[1],
    textAlign: 'center',
    fontSize: 10,
  },
  labelBold: {
    fontWeight: fontWeight.semibold,
  },
  connector: {
    marginHorizontal: spacing[1],
    height: 2,
    flex: 1,
  },
});
