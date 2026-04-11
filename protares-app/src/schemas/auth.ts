import { z } from 'zod';

/**
 * Auth form schemas. We intentionally keep messages short and plain
 * English — responders will read these under stress.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Please enter a valid email');

/**
 * NCSC advises password length > complexity. We require 10+ chars
 * with at least one letter and one number — easier to type quickly
 * than a 14-char mixed-case symbol requirement but still secure.
 */
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .refine((v) => /[a-zA-Z]/.test(v), 'Must contain a letter')
  .refine((v) => /\d/.test(v), 'Must contain a number');

export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^\+?[0-9\s-]{10,15}$/.test(v),
    'Please enter a valid phone number'
  )
  .optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(60),
    lastName: z.string().trim().min(1, 'Last name is required').max(60),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: 'You must accept the privacy notice to continue',
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
