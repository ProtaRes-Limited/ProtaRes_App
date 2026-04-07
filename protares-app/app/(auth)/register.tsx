import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
      // In a real app: await authService.signUp(data)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding bgColor="bg-white">
      <View className="py-8">
        {/* Branding */}
        <View className="items-center mb-8">
          <View className="w-14 h-14 rounded-xl bg-primary-500 items-center justify-center mb-3">
            <Shield size={30} color="#FFFFFF" />
          </View>
          <Text className="text-2xl font-bold text-primary-500 mb-1">
            Join ProtaRes
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Register as a community emergency responder
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View className="bg-emergency-50 border border-emergency-200 rounded-lg p-4 mb-6">
            <Text className="text-emergency-600 text-sm text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="flex-row gap-3 mb-0">
          <View className="flex-1">
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
          <View className="flex-1">
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
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
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
            validate: (val) =>
              val === password || 'Passwords do not match',
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

        {/* Terms Checkbox */}
        <Controller
          control={control}
          name="termsAccepted"
          render={({ field: { onChange, value } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              className="flex-row items-start gap-3 mb-3"
            >
              <View
                className={`w-5 h-5 mt-0.5 rounded border-2 items-center justify-center ${
                  value
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {value && (
                  <Text className="text-white text-xs font-bold">
                    ✓
                  </Text>
                )}
              </View>
              <Text className="flex-1 text-sm text-gray-600">
                I agree to the{' '}
                <Text className="text-primary-500 font-medium">
                  Terms of Service
                </Text>
              </Text>
            </Pressable>
          )}
        />

        <Controller
          control={control}
          name="privacyAccepted"
          render={({ field: { onChange, value } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              className="flex-row items-start gap-3 mb-8"
            >
              <View
                className={`w-5 h-5 mt-0.5 rounded border-2 items-center justify-center ${
                  value
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {value && (
                  <Text className="text-white text-xs font-bold">
                    ✓
                  </Text>
                )}
              </View>
              <Text className="flex-1 text-sm text-gray-600">
                I have read and accept the{' '}
                <Text className="text-primary-500 font-medium">
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>
          )}
        />

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        >
          Create Account
        </Button>

        {/* Login Link */}
        <View className="flex-row items-center justify-center mt-6 mb-8">
          <Text className="text-gray-500 text-sm">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-primary-500 text-sm font-semibold">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
