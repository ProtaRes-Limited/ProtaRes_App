import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  Car,
  Brain,
  Pill,
  AlertTriangle,
  Wind,
  Flame,
  HelpCircle,
  ChevronLeft,
  CheckCircle,
  Minus,
  Plus,
  Users,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { EmergencyType } from '@/types';

interface EmergencyTypeOption {
  type: EmergencyType;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const EMERGENCY_TYPES: EmergencyTypeOption[] = [
  {
    type: 'cardiac_arrest',
    label: 'Cardiac Arrest',
    icon: Heart,
    color: '#DA291C',
    bgColor: 'bg-emergency-100',
  },
  {
    type: 'road_accident',
    label: 'Road Accident',
    icon: Car,
    color: '#DA291C',
    bgColor: 'bg-emergency-100',
  },
  {
    type: 'stroke',
    label: 'Stroke',
    icon: Brain,
    color: '#B91C1C',
    bgColor: 'bg-emergency-100',
  },
  {
    type: 'anaphylaxis',
    label: 'Anaphylaxis',
    icon: AlertTriangle,
    color: '#D97706',
    bgColor: 'bg-warning-100',
  },
  {
    type: 'breathing_difficulty',
    label: 'Breathing Difficulty',
    icon: Wind,
    color: '#005EB8',
    bgColor: 'bg-primary-100',
  },
  {
    type: 'overdose',
    label: 'Overdose',
    icon: Pill,
    color: '#7B2D8E',
    bgColor: 'bg-purple-100',
  },
  {
    type: 'burn',
    label: 'Burn',
    icon: Flame,
    color: '#D97706',
    bgColor: 'bg-warning-100',
  },
  {
    type: 'other_medical',
    label: 'Other',
    icon: HelpCircle,
    color: '#6B7280',
    bgColor: 'bg-gray-100',
  },
];

type Step = 'type' | 'details' | 'submitted';

export default function ReportEmergencyScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [casualtyCount, setCasualtyCount] = useState(1);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectType = (type: EmergencyType) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setStep('submitted');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
    } else {
      router.back();
    }
  };

  // Step 1: Select Type
  if (step === 'type') {
    return (
      <Screen safeArea padded={false}>
        <Header title="Report Emergency" onBackPress={() => router.back()} />
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className="mt-4 mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              What type of emergency?
            </Text>
            <Text className="text-sm text-gray-500">
              Select the type that best describes the situation
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-8">
            {EMERGENCY_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.type}
                  onPress={() => handleSelectType(item.type)}
                  className="w-[48%] bg-white border border-gray-200 rounded-xl p-4 items-center active:bg-gray-50"
                >
                  <View
                    className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${item.bgColor}`}
                  >
                    <Icon size={28} color={item.color} />
                  </View>
                  <Text className="text-sm font-semibold text-gray-900 text-center">
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Card variant="outlined" className="mb-8">
            <View className="flex-row items-center gap-3">
              <AlertTriangle size={20} color="#DA291C" />
              <Text className="flex-1 text-sm text-gray-600">
                If someone is in immediate danger, always call{' '}
                <Text className="font-bold text-emergency-600">999</Text> first.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  // Step 2: Enter Details
  if (step === 'details') {
    const selectedOption = EMERGENCY_TYPES.find((t) => t.type === selectedType);

    return (
      <Screen safeArea padded={false} keyboardAvoiding>
        <Header title="Report Details" onBackPress={handleBack} />
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Selected Type */}
          <Card variant="active" className="mt-4 mb-4">
            <View className="flex-row items-center gap-3">
              {selectedOption && (
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${selectedOption.bgColor}`}
                >
                  <selectedOption.icon
                    size={20}
                    color={selectedOption.color}
                  />
                </View>
              )}
              <Text className="text-base font-semibold text-gray-900">
                {selectedOption?.label}
              </Text>
            </View>
          </Card>

          {/* Casualty Count */}
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Number of Casualties
          </Text>
          <View className="flex-row items-center gap-4 mb-6">
            <Pressable
              onPress={() =>
                setCasualtyCount((c) => Math.max(1, c - 1))
              }
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
            >
              <Minus size={20} color="#374151" />
            </Pressable>

            <View className="w-16 h-12 rounded-lg bg-white border border-gray-300 items-center justify-center">
              <Text className="text-xl font-bold text-gray-900">
                {casualtyCount}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setCasualtyCount((c) => Math.min(20, c + 1))
              }
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
            >
              <Plus size={20} color="#374151" />
            </Pressable>
          </View>

          {/* Description */}
          <Input
            label="Description"
            placeholder="Describe the situation — what happened, visible injuries, any hazards..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            helperText="Provide as much detail as possible to help responders prepare"
          />

          {/* Submit */}
          <View className="gap-3 mt-4 mb-8">
            <Button
              variant="emergency"
              size="lg"
              fullWidth
              onPress={handleSubmit}
              loading={submitting}
              icon={AlertTriangle}
            >
              Submit Emergency Report
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onPress={handleBack}
            >
              Go Back
            </Button>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // Step 3: Submitted Confirmation
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-success-100 items-center justify-center mb-6">
          <CheckCircle size={44} color="#009639" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          Report Submitted
        </Text>

        <Text className="text-base text-gray-500 text-center mb-2">
          Your emergency report has been sent to nearby responders.
        </Text>

        <Text className="text-sm text-gray-400 text-center mb-8">
          Stay safe and keep clear of any hazards. Emergency services have been
          notified.
        </Text>

        <Card variant="outlined" className="w-full mb-6">
          <View className="flex-row items-center gap-3">
            <Users size={20} color="#005EB8" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                Nearby responders notified
              </Text>
              <Text className="text-xs text-gray-500">
                Qualified responders in your area are being alerted
              </Text>
            </View>
          </View>
        </Card>

        <View className="w-full gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          >
            Return Home
          </Button>

          <Button
            variant="ghost"
            fullWidth
            onPress={() => {
              setStep('type');
              setSelectedType(null);
              setCasualtyCount(1);
              setDescription('');
            }}
          >
            Report Another Emergency
          </Button>
        </View>
      </View>
    </Screen>
  );
}
