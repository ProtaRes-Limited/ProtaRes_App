import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Car, Stethoscope, AlertTriangle, Flame, Pill, CheckCircle } from 'lucide-react';
import { reportEmergencySchema, type ReportEmergencyFormData } from '@/schemas/emergency';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { EmergencyType } from '@/types';

const emergencyTypes: { type: EmergencyType; label: string; icon: typeof Heart; color: string }[] = [
  { type: 'road_accident', label: 'Road Accident', icon: Car, color: 'bg-emergency-50 text-emergency-600' },
  { type: 'cardiac_arrest', label: 'Cardiac Emergency', icon: Heart, color: 'bg-red-50 text-red-600' },
  { type: 'stroke', label: 'Stroke', icon: Stethoscope, color: 'bg-purple-50 text-purple-600' },
  { type: 'stabbing', label: 'Serious Injury', icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
  { type: 'burn', label: 'Burns', icon: Flame, color: 'bg-yellow-50 text-yellow-600' },
  { type: 'overdose', label: 'Overdose', icon: Pill, color: 'bg-blue-50 text-blue-600' },
  { type: 'other_medical', label: 'Other Medical', icon: Stethoscope, color: 'bg-gray-50 text-gray-600' },
  { type: 'other_trauma', label: 'Other / Unsure', icon: AlertTriangle, color: 'bg-gray-50 text-gray-600' },
];

export function ReportEmergencyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'type' | 'details' | 'submitted'>('type');
  const { handleSubmit, setValue, formState: { isSubmitting } } = useForm<ReportEmergencyFormData>({
    resolver: zodResolver(reportEmergencySchema),
    defaultValues: {
      location: { latitude: 51.5074, longitude: -0.1278 },
      casualtyCount: 1,
    },
  });

  const [description, setDescription] = useState('');
  const [casualtyCount, setCasualtyCount] = useState(1);

  const handleTypeSelect = (type: EmergencyType) => {
    setValue('emergencyType', type);
    setStep('details');
  };

  const onSubmit = async () => {
    // In production, would call emergencyService.reportEmergency
    setStep('submitted');
  };

  if (step === 'submitted') {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Report Emergency" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-4">
            <CheckCircle size={40} className="text-success-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h2>
          <p className="text-gray-500 text-center mb-6">
            Emergency services have been notified. Trained responders are being alerted.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/app')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Quick Details" showBack onBack={() => setStep('type')} />
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">How many people are hurt?</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => { setCasualtyCount(n); setValue('casualtyCount', n); }}
                  className={cn('flex-1 h-11 rounded-lg border-2 font-semibold transition-colors',
                    casualtyCount === n ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => { setCasualtyCount(4); setValue('casualtyCount', 4); }}
                className={cn('flex-1 h-11 rounded-lg border-2 font-semibold transition-colors',
                  casualtyCount >= 4 ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'
                )}
              >
                3+
              </button>
            </div>
          </div>

          <Input
            label="Additional Details (optional)"
            placeholder="Any other important information..."
            value={description}
            onChange={(e) => { setDescription(e.target.value); setValue('description', e.target.value); }}
          />

          <Button variant="emergency" fullWidth size="lg" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Report Emergency
          </Button>

          <p className="text-gray-400 text-xs text-center">
            Always call 999 for life-threatening emergencies
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="What's Happening?" showBack />
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {emergencyTypes.map(({ type, label, icon: Icon, color }) => (
            <Card key={type} variant="outlined" clickable onClick={() => handleTypeSelect(type)}>
              <div className="flex flex-col items-center py-3">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-2', color)}>
                  <Icon size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
