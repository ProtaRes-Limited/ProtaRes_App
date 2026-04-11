import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/schemas/auth';
import { sendPasswordResetEmail } from '@/services/auth';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, spacing, typography } from '@/config/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(values.email);
      Alert.alert(
        'Check your email',
        'If an account exists for this email, we have sent a password reset link.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'forgot-password' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable withKeyboardAvoid padded={false}>
      <Header title="Reset password" showBack />
      <View style={styles.body}>
        <Text style={styles.description}>
          Enter the email you used to register. We'll send a link to reset
          your password.
        </Text>

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

        <Button
          label="Send reset link"
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
  body: { padding: spacing.xl },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
