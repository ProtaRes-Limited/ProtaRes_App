import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/utils';

type StepStatus = 'completed' | 'active' | 'pending';

const STEPS = [
  'Accepted',
  'En Route',
  'On Scene',
  'Handover',
  'Complete',
] as const;

type Step = (typeof STEPS)[number];

interface StatusStepperProps {
  currentStep: Step;
}

function getStepStatus(stepIndex: number, currentIndex: number): StepStatus {
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export function StatusStepper({ currentStep }: StatusStepperProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <View className="flex-row items-center justify-between px-2">
      {STEPS.map((step, index) => {
        const status = getStepStatus(index, currentIndex);
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step} className="flex-1 flex-row items-center">
            <View className="items-center">
              <View
                className={cn(
                  'h-7 w-7 items-center justify-center rounded-full',
                  status === 'completed' && 'bg-success-500',
                  status === 'active' && 'bg-primary-500',
                  status === 'pending' && 'bg-gray-300',
                )}
              >
                {status === 'completed' ? (
                  <Check size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      status === 'active' ? 'text-white' : 'text-gray-500',
                    )}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <Text
                className={cn(
                  'mt-1 text-center text-[10px]',
                  status === 'completed' && 'font-semibold text-success-600',
                  status === 'active' && 'font-semibold text-primary-600',
                  status === 'pending' && 'text-gray-400',
                )}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>

            {!isLast && (
              <View
                className={cn(
                  'mx-1 h-0.5 flex-1',
                  index < currentIndex ? 'bg-success-500' : 'bg-gray-300',
                )}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
