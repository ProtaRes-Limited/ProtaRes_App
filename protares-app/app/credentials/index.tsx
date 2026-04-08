import { View, Text, Pressable, StyleSheet } from 'react-native';
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
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

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
    <Card variant="outlined" style={styles.verifyCard} onPress={onPress}>
      <View style={styles.verifyRow}>
        <View
          style={[styles.verifyIconCircle, { backgroundColor: iconBg }]}
        >
          <Icon size={24} color={iconColor} />
        </View>
        <View style={styles.verifyContent}>
          <Text style={styles.verifyTitle}>
            {title}
          </Text>
          <Text style={styles.verifyDescription}>
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
      <View style={styles.container}>
        {/* Current Tier */}
        <Card variant="active" style={styles.currentTierCard}>
          <View style={styles.currentTierRow}>
            <View style={styles.currentTierIconCircle}>
              <ShieldCheck size={24} color="#005EB8" />
            </View>
            <View style={styles.currentTierContent}>
              <Text style={styles.currentTierLabel}>Current Tier</Text>
              <Text style={styles.currentTierValue}>
                {user?.tier ? TIER_LABELS[user.tier] : 'Unverified'}
              </Text>
            </View>
          </View>
          <TierBadge tier={tierNumber as 1 | 2 | 3 | 4} />
        </Card>

        {/* Verify Options */}
        <Text style={styles.sectionTitle}>
          Verify Your Credentials
        </Text>
        <Text style={styles.sectionSubtitle}>
          Verify your professional qualifications to unlock higher tiers and
          respond to more emergency types.
        </Text>

        <VerifyOption
          icon={Stethoscope}
          iconColor="#009639"
          iconBg={colors.success[100]}
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
          iconBg={colors.purple[100]}
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
          iconBg={colors.warning[100]}
          title="First Aid Certificate"
          description="Upload your current first aid certification"
          tierLabel="Unlocks Tier 3"
          onPress={() => {
            // Navigate to verification flow
          }}
        />

        {/* Info Card */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <CheckCircle size={20} color="#009639" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Secure Verification
              </Text>
              <Text style={styles.infoDescription}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  verifyCard: {
    marginBottom: spacing[3],
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  verifyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyContent: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing[0.5],
  },
  verifyDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing[1.5],
  },
  currentTierCard: {
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  currentTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  currentTierIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTierContent: {
    flex: 1,
  },
  currentTierLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  currentTierValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing[4],
  },
  infoCard: {
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
    marginBottom: spacing[1],
  },
  infoDescription: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
});
