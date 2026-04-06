import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { authService } from '@/services/auth';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await authService.signIn(data.email, data.password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">ProtaRes</h1>
        <p className="text-gray-500 mt-1">Every Second Counts. Every Responder Matters.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>

      {error && (
        <div className="bg-emergency-50 border border-emergency-200 text-emergency-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField control={control} name="email" label="Email" placeholder="you@example.com" type="email" autoComplete="email" />
        <FormField control={control} name="password" label="Password" placeholder="••••••••" isPassword autoComplete="current-password" />

        <Button type="submit" loading={isSubmitting} fullWidth size="lg" className="mt-2">
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <Link to="/auth/forgot-password" className="text-primary-500 text-sm hover:underline block">
          Forgot password?
        </Link>
        <p className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary-500 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
