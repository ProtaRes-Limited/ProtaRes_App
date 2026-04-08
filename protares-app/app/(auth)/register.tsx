import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (!data.termsAccepted || !data.privacyAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding bgColor={colors.white}>
      <View style={styles.container}>
        <View style={styles.branding}>
          <View style={styles.logoWrapper}>
            <Shield size={30} color={colors.white} />
          </View>
          <Text style={styles.appName}>Join ProtaRes</Text>
          <Text style={styles.tagline}>Register as a community emergency responder</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Controller
              control={control}
              name="firstName"
              rules={{ required: 'First name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Sarah"
                  value={value}
                  onChangeText={onChange}
                  error={errors.firstName?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
          <View style={styles.nameField}>
            <Controller
              control={control}
              name="lastName"
              rules={{ required: 'Last name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Johnson"
                  value={value}
                  onChangeText={onChange}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email',
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
          name="phone"
          rules={{
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[\d\s-]{10,}$/,
              message: 'Please enter a valid phone number',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Phone Number"
              placeholder="+44 7700 900 123"
              value={value}
              onChangeText={onChange}
              error={errors.phone?.message}
              keyboardType="phone-pad"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="Minimum 8 characters"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (val) => val === password || 'Passwords do not match',
          }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={value}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="termsAccepted"
          render={({ field: { onChange, value } }) => (
            <Pressable onPress={() => onChange(!value)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, value ? styles.checkboxChecked : styles.checkboxUnchecked]}>
                {value && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the <Text style={styles.linkText}>Terms of Service</Text>
              </Text>
            </Pressable>
          )}
        />

        <Controller
          control={control}
          name="privacyAccepted"
          render={({ field: { onChange, value } }) => (
            <Pressable onPress={() => onChange(!value)} style={[styles.checkboxRow, styles.marginBottom8]}>
              <View style={[styles.checkbox, value ? styles.checkboxChecked : styles.checkboxUnchecked]}>
                {value && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I have read and accept the <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </Pressable>
          )}
        />

        <Button variant="primary" size="lg" fullWidth onPress={handleSubmit(onSubmit)} loading={loading}>
          Create Account
        </Button>

        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkLabel}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.loginLinkAction}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[8],
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logoWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  appName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[500],
    marginBottom: spacing[1],
  },
  tagline: {
    fontSize: fontSize.sm,
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
  nameRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  nameField: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  marginBottom8: {
    marginBottom: spacing[8],
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxUnchecked: {
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  linkText: {
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[8],
  },
  loginLinkLabel: {
    color: colors.gray[500],
    fontSize: fontSize.sm,
  },
  loginLinkAction: {
    color: colors.primary[500],
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
