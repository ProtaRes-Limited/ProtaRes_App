import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResponseStatus } from '@/types';

interface StatusStepperProps {
  currentStatus: ResponseStatus;
}

const steps: { status: ResponseStatus; label: string }[] = [
  { status: 'accepted', label: 'Accepted' },
  { status: 'en_route', label: 'En Route' },
  { status: 'on_scene', label: 'On Scene' },
  { status: 'completing', label: 'Handover' },
  { status: 'completed', label: 'Complete' },
];

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex flex-col items-center flex-1 relative">
            {index > 0 && (
              <div
                className={cn(
                  'absolute top-3 right-1/2 h-0.5 w-full -z-10',
                  isComplete ? 'bg-success-500' : 'bg-gray-200'
                )}
              />
            )}
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                isComplete ? 'bg-success-500 text-white' : isCurrent ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              )}
            >
              {isComplete ? <Check size={14} /> : index + 1}
            </div>
            <span
              className={cn(
                'text-[10px] mt-1 text-center leading-tight',
                isCurrent ? 'text-primary-600 font-semibold' : 'text-gray-500'
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
