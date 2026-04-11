import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { signInWithEmail, signInWithGoogle } from '@/services/auth';
import { mapError } from '@/lib/error-messages';
import { captureException } from '@/lib/sentry';
import { colors, spacing, typography } from '@/config/theme';

export default function LoginScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await signInWithEmail(values.email, values.password);
      // AuthGate will redirect automatically once the session is set.
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'login.email' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const mapped = mapError(err);
      captureException(err, { context: 'login.google' });
      Alert.alert(mapped.title, mapped.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen scrollable withKeyboardAvoid>
      <View style={styles.hero}>
        <Text style={styles.title}>ProtaRes</Text>
        <Text style={styles.subtitle}>
          Emergency Response Coordination
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email?.message}
              leftAdornment={<Mail size={18} color={colors.grey3} />}
              required
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
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              error={errors.password?.message}
              leftAdornment={<Lock size={18} color={colors.grey3} />}
              required
            />
          )}
        />

        <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </Link>

        <Button
          label="Sign in"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          size="lg"
          fullWidth
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Continue with Google"
          onPress={handleGoogle}
          loading={googleLoading}
          variant="outline"
          size="lg"
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to ProtaRes? </Text>
        <Link href="/(auth)/register">
          <Text style={[styles.linkText, styles.linkBold]}>Create account</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.display,
    color: colors.nhsBlue,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  form: { marginBottom: spacing.xl },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.nhsBlue,
  },
  linkBold: { fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
