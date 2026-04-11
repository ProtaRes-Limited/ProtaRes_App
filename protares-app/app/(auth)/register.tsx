import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterFormValues } from '@/schemas/auth';
import { signUpWithEmail } from '@/services/auth';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, radii, spacing, typography } from '@/config/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await signUpWithEmail(values.email, values.password, {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });
      Alert.alert(
        'Check your email',
        "We've sent a confirmation link to your inbox. Please verify your email to continue.",
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'register.email' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable withKeyboardAvoid padded={false}>
      <Header title="Create account" showBack />
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                  textContentType="givenName"
                  required
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                  textContentType="familyName"
                  required
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone (optional)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              hint="Used for SMS fallback if push fails"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              hint="At least 10 characters, with a letter and a number"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              secureTextEntry
              autoCapitalize="none"
              required
            />
          )}
        />

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              style={styles.consent}
              onPress={() => onChange(!value as unknown as true)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: Boolean(value) }}
              accessibilityLabel="Accept privacy notice and terms"
            >
              <View style={[styles.checkbox, value ? styles.checkboxChecked : null]}>
                {value ? <Check size={16} color={colors.white} /> : null}
              </View>
              <Text style={styles.consentText}>
                I accept the{' '}
                <Text
                  style={styles.consentLink}
                  onPress={() => Linking.openURL('https://protares.co.uk/privacy')}
                >
                  Privacy Notice
                </Text>{' '}
                and understand that my data will be processed in accordance with UK GDPR.
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.acceptTerms?.message ? (
          <Text style={styles.consentError}>{errors.acceptTerms.message}</Text>
        ) : null}

        <Button
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          size="lg"
          fullWidth
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text style={styles.linkBold}>Sign in</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.xl },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  consent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.nhsBlue,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.nhsBlue,
  },
  consentText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  consentLink: { color: colors.nhsBlue, fontWeight: '600' },
  consentError: {
    ...typography.caption,
    color: colors.emergencyRed,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { ...typography.bodySmall, color: colors.textSecondary },
  linkBold: {
    ...typography.bodySmall,
    color: colors.nhsBlue,
    fontWeight: '700',
  },
});
