import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Shield, Mail, Lock } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app this would call authService.signIn(data)
      // For now, simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding bgColor="bg-white">
      <View className="flex-1 justify-center py-12">
        {/* Branding */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-primary-500 items-center justify-center mb-4">
            <Shield size={44} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-primary-500 mb-2">
            ProtaRes
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Community Emergency Response Network
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-emergency-50 border border-emergency-200 rounded-lg p-4 mb-6">
            <Text className="text-emergency-600 text-sm text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="mb-6">
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

          <Pressable className="self-end mb-6">
            <Text className="text-sm text-primary-500 font-medium">
              Forgot password?
            </Text>
          </Pressable>
        </View>

        {/* Sign In Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        >
          Sign In
        </Button>

        {/* Register Link */}
        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-gray-500 text-sm">
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-primary-500 text-sm font-semibold">
                Create Account
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
