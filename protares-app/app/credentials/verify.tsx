import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { credentialSchema, type CredentialFormValues } from '@/schemas/credentials';
import { verifyCredential } from '@/services/credentials';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, spacing, typography } from '@/config/theme';

const bodies: Array<{ value: CredentialFormValues['body']; label: string; description: string }> = [
  { value: 'gmc', label: 'GMC', description: 'General Medical Council (doctors)' },
  { value: 'nmc', label: 'NMC', description: 'Nursing and Midwifery Council' },
  { value: 'hcpc', label: 'HCPC', description: 'Health and Care Professions Council' },
  { value: 'first_aid', label: 'First Aid', description: 'Certified first aid qualification' },
];

export default function VerifyCredentialScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedBody, setSelectedBody] = useState<CredentialFormValues['body']>('gmc');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { body: 'gmc', number: '', holderName: '' },
  });

  const onSubmit = async (values: CredentialFormValues) => {
    setSubmitting(true);
    try {
      const result = await verifyCredential({
        body: selectedBody,
        rawNumber: values.number,
        holderName: values.holderName,
      });
      if (result.verified) {
        Alert.alert(
          'Credential verified',
          'Your registration has been verified. You now have an Active Responder profile.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Verification failed',
          'We could not verify this credential. Double-check the number and name on register.'
        );
      }
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'verifyCredential' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable withKeyboardAvoid padded={false}>
      <Header title="Verify credential" showBack />
      <View style={styles.body}>
        <Text style={styles.description}>
          We'll check your registration with the regulator. Your credential
          number is hashed on-device and never stored in plaintext.
        </Text>

        <Text style={styles.sectionLabel}>Regulator</Text>
        <View style={styles.bodyGrid}>
          {bodies.map((b) => (
            <View
              key={b.value}
              style={[
                styles.bodyOption,
                selectedBody === b.value && styles.bodyOptionActive,
              ]}
              onTouchEnd={() => setSelectedBody(b.value)}
              accessibilityRole="radio"
              accessible
              accessibilityState={{ selected: selectedBody === b.value }}
            >
              <Text
                style={[
                  styles.bodyOptionLabel,
                  selectedBody === b.value && styles.bodyOptionLabelActive,
                ]}
              >
                {b.label}
              </Text>
              <Text style={styles.bodyOptionDescription}>{b.description}</Text>
            </View>
          ))}
        </View>

        <Controller
          control={control}
          name="number"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Credential number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={
                selectedBody === 'gmc'
                  ? '7-digit GMC number'
                  : selectedBody === 'nmc'
                    ? 'NMC PIN e.g. 12A3456B'
                    : 'Registration number'
              }
              autoCapitalize="characters"
              error={errors.number?.message}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="holderName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Name on register"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              hint="Exactly as recorded with the regulator"
              error={errors.holderName?.message}
              required
            />
          )}
        />

        <Button
          label="Verify credential"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          size="lg"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  bodyGrid: { gap: spacing.sm, marginBottom: spacing.md },
  bodyOption: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  bodyOptionActive: {
    borderColor: colors.nhsBlue,
    backgroundColor: '#E1EEFA',
  },
  bodyOptionLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bodyOptionLabelActive: { color: colors.nhsBlue },
  bodyOptionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
