import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const _setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (_data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app this would call authService.signIn(data)
      // For now, simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding bgColor={colors.white}>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.branding}>
          <View style={styles.logoWrapper}>
            <Shield size={44} color={colors.white} />
          </View>
          <Text style={styles.appName}>ProtaRes</Text>
          <Text style={styles.tagline}>Community Emergency Response Network</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="your.email@nhs.net"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <Pressable style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* Sign In Button */}
        <Button variant="primary" size="lg" fullWidth onPress={handleSubmit(onSubmit)} loading={loading}>
          Sign In
        </Button>

        {/* Register Link */}
        <View style={styles.registerLinkRow}>
          <Text style={styles.registerLinkLabel}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={styles.registerLinkAction}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  appName: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
    marginBottom: spacing[2],
  },
  tagline: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.emergency[50],
    borderWidth: 1,
    borderColor: colors.emergency[200],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  errorText: {
    color: colors.emergency[600],
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing[6],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing[6],
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
  },
  registerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[8],
  },
  registerLinkLabel: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
  },
  registerLinkAction: {
    color: colors.primary[500],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
