import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/schemas/auth';
import { authService } from '@/services/auth';
import { FormField } from '@/components/forms/FormField';
import { CheckboxField } from '@/components/forms/CheckboxField';
import { Button } from '@/components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', phone: '',
      password: '', confirmPassword: '',
      acceptTerms: false, acceptPrivacy: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await authService.signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-3">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 text-sm mt-1">Join the ProtaRes responder network</p>
      </div>

      {error && (
        <div className="bg-emergency-50 border border-emergency-200 text-emergency-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={control} name="firstName" label="First Name" placeholder="John" autoComplete="given-name" />
          <FormField control={control} name="lastName" label="Last Name" placeholder="Smith" autoComplete="family-name" />
        </div>
        <FormField control={control} name="email" label="Email" placeholder="you@example.com" type="email" autoComplete="email" />
        <FormField control={control} name="phone" label="Phone" placeholder="+44 7700 900000" type="tel" autoComplete="tel" />
        <FormField control={control} name="password" label="Password" placeholder="Min 8 chars, 1 upper, 1 number" isPassword autoComplete="new-password" />
        <FormField control={control} name="confirmPassword" label="Confirm Password" placeholder="••••••••" isPassword autoComplete="new-password" />

        <div className="mt-2">
          <CheckboxField control={control} name="acceptTerms" label="I agree to the Terms of Service" />
          <CheckboxField control={control} name="acceptPrivacy" label="I agree to the Privacy Policy" />
        </div>

        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Create Account
        </Button>
      </form>

      <p className="text-gray-500 text-sm text-center mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-500 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
