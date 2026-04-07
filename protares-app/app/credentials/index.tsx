import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Award,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge, TierBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth';
import { TIER_LABELS } from '@/lib/constants';

interface VerifyOptionProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  tierLabel: string;
  onPress: () => void;
}

function VerifyOption({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  tierLabel,
  onPress,
}: VerifyOptionProps) {
  return (
    <Card variant="outlined" className="mb-3" onPress={onPress}>
      <View className="flex-row items-center gap-3">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${iconBg}`}
        >
          <Icon size={24} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-0.5">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 mb-1.5">
            {description}
          </Text>
          <Badge variant="tier">{tierLabel}</Badge>
        </View>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </Card>
  );
}

export default function CredentialsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const tierNumber = user?.tier === 'tier1_active_healthcare'
    ? 1
    : user?.tier === 'tier2_retired_healthcare'
    ? 2
    : user?.tier === 'tier3_first_aid'
    ? 3
    : 4;

  return (
    <Screen safeArea padded={false}>
      <Header title="Credentials" />
      <View className="flex-1 px-4">
        {/* Current Tier */}
        <Card variant="active" className="mt-4 mb-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
              <ShieldCheck size={24} color="#005EB8" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Current Tier</Text>
              <Text className="text-base font-bold text-gray-900">
                {user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}
              </Text>
            </View>
          </View>
          <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
        </Card>

        {/* Verify Options */}
        <Text className="text-lg font-bold text-gray-900 mb-3">
          Verify Your Credentials
        </Text>
        <Text className="text-sm text-gray-500 mb-4">
          Verify your professional qualifications to unlock higher tiers and
          respond to more emergency types.
        </Text>

        <VerifyOption
          icon={Stethoscope}
          iconColor="#009639"
          iconBg="bg-success-100"
          title="GMC Registration (Doctor)"
          description="Verify your General Medical Council registration number"
          tierLabel="Unlocks Tier 1"
          onPress={() => {
            // Navigate to verification flow
          }}
        />

        <VerifyOption
          icon={HeartPulse}
          iconColor="#7B2D8E"
          iconBg="bg-purple-100"
          title="NMC Registration (Nurse)"
          description="Verify your Nursing and Midwifery Council PIN"
          tierLabel="Unlocks Tier 1"
          onPress={() => {
            // Navigate to verification flow
          }}
        />

        <VerifyOption
          icon={Award}
          iconColor="#F5A623"
          iconBg="bg-warning-100"
          title="First Aid Certificate"
          description="Upload your current first aid certification"
          tierLabel="Unlocks Tier 3"
          onPress={() => {
            // Navigate to verification flow
          }}
        />

        {/* Info Card */}
        <Card variant="outlined" className="mt-4 mb-8">
          <View className="flex-row items-start gap-3">
            <CheckCircle size={20} color="#009639" />
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 mb-1">
                Secure Verification
              </Text>
              <Text className="text-xs text-gray-500">
                All credentials are verified through official registries and
                encrypted. Your data is handled in compliance with GDPR and NHS
                data protection standards.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
