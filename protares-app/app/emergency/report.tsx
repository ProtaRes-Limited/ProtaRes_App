import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
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
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';
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
    bgColor: colors.emergency[100],
  },
  {
    type: 'road_accident',
    label: 'Road Accident',
    icon: Car,
    color: '#DA291C',
    bgColor: colors.emergency[100],
  },
  {
    type: 'stroke',
    label: 'Stroke',
    icon: Brain,
    color: '#B91C1C',
    bgColor: colors.emergency[100],
  },
  {
    type: 'anaphylaxis',
    label: 'Anaphylaxis',
    icon: AlertTriangle,
    color: '#D97706',
    bgColor: colors.warning[100],
  },
  {
    type: 'breathing_difficulty',
    label: 'Breathing Difficulty',
    icon: Wind,
    color: '#005EB8',
    bgColor: colors.primary[100],
  },
  {
    type: 'overdose',
    label: 'Overdose',
    icon: Pill,
    color: '#7B2D8E',
    bgColor: colors.purple[100],
  },
  {
    type: 'burn',
    label: 'Burn',
    icon: Flame,
    color: '#D97706',
    bgColor: colors.warning[100],
  },
  {
    type: 'other_medical',
    label: 'Other',
    icon: HelpCircle,
    color: '#6B7280',
    bgColor: colors.gray[100],
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.typeHeader}>
            <Text style={styles.typeHeaderTitle}>
              What type of emergency?
            </Text>
            <Text style={styles.typeHeaderSubtitle}>
              Select the type that best describes the situation
            </Text>
          </View>

          <View style={styles.typeGrid}>
            {EMERGENCY_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.type}
                  onPress={() => handleSelectType(item.type)}
                  style={({ pressed }) => [
                    styles.typeTile,
                    pressed && { backgroundColor: colors.gray[50] },
                  ]}
                >
                  <View
                    style={[
                      styles.typeIconCircle,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Icon size={28} color={item.color} />
                  </View>
                  <Text style={styles.typeTileLabel}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Card variant="outlined" style={styles.infoCard}>
            <View style={styles.infoCardRow}>
              <AlertTriangle size={20} color="#DA291C" />
              <Text style={styles.infoCardText}>
                If someone is in immediate danger, always call{' '}
                <Text style={styles.infoCardHighlight}>999</Text> first.
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Selected Type */}
          <Card variant="active" style={styles.selectedTypeCard}>
            <View style={styles.selectedTypeRow}>
              {selectedOption && (
                <View
                  style={[
                    styles.selectedTypeIcon,
                    { backgroundColor: selectedOption.bgColor },
                  ]}
                >
                  <selectedOption.icon
                    size={20}
                    color={selectedOption.color}
                  />
                </View>
              )}
              <Text style={styles.selectedTypeLabel}>
                {selectedOption?.label}
              </Text>
            </View>
          </Card>

          {/* Casualty Count */}
          <Text style={styles.fieldLabel}>
            Number of Casualties
          </Text>
          <View style={styles.casualtyRow}>
            <Pressable
              onPress={() =>
                setCasualtyCount((c) => Math.max(1, c - 1))
              }
              style={({ pressed }) => [
                styles.casualtyButton,
                pressed && { backgroundColor: colors.gray[200] },
              ]}
            >
              <Minus size={20} color="#374151" />
            </Pressable>

            <View style={styles.casualtyCountBox}>
              <Text style={styles.casualtyCountText}>
                {casualtyCount}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setCasualtyCount((c) => Math.min(20, c + 1))
              }
              style={({ pressed }) => [
                styles.casualtyButton,
                pressed && { backgroundColor: colors.gray[200] },
              ]}
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
          <View style={styles.detailsActions}>
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
      <View style={styles.submittedWrapper}>
        <View style={styles.submittedIconCircle}>
          <CheckCircle size={44} color="#009639" />
        </View>

        <Text style={styles.submittedTitle}>
          Report Submitted
        </Text>

        <Text style={styles.submittedBody}>
          Your emergency report has been sent to nearby responders.
        </Text>

        <Text style={styles.submittedSubBody}>
          Stay safe and keep clear of any hazards. Emergency services have been
          notified.
        </Text>

        <Card variant="outlined" style={styles.submittedCard}>
          <View style={styles.submittedCardRow}>
            <Users size={20} color="#005EB8" />
            <View style={styles.submittedCardContent}>
              <Text style={styles.submittedCardTitle}>
                Nearby responders notified
              </Text>
              <Text style={styles.submittedCardSubtitle}>
                Qualified responders in your area are being alerted
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.submittedActions}>
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  typeHeader: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  typeHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[1],
  },
  typeHeaderSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  typeTile: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
  },
  typeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  typeTileLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing[8],
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  infoCardText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  infoCardHighlight: {
    fontWeight: fontWeight.bold,
    color: colors.emergency[600],
  },
  selectedTypeCard: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  selectedTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  selectedTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing[2],
  },
  casualtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  casualtyButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  casualtyCountBox: {
    width: 64,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  casualtyCountText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  detailsActions: {
    gap: spacing[3],
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  submittedWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  submittedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  submittedTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  submittedBody: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  submittedSubBody: {
    fontSize: fontSize.sm,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  submittedCard: {
    width: '100%',
    marginBottom: spacing[6],
  },
  submittedCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  submittedCardContent: {
    flex: 1,
  },
  submittedCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  submittedCardSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  submittedActions: {
    width: '100%',
    gap: spacing[3],
  },
});
