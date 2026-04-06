import { z } from 'zod';

export const gmcVerificationSchema = z.object({
  gmcNumber: z
    .string()
    .min(1, 'GMC number is required')
    .regex(/^[0-9]{7}$/, 'GMC number must be exactly 7 digits'),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(5, 'Please enter your full name as registered with the GMC'),
  consent: z.boolean().refine((val) => val === true, 'You must consent to credential verification'),
});

export type GMCVerificationFormData = z.infer<typeof gmcVerificationSchema>;

export const nmcVerificationSchema = z.object({
  nmcPin: z
    .string()
    .min(1, 'NMC PIN is required')
    .regex(/^[0-9]{2}[A-Z][0-9]{4}[A-Z]$/, 'Please enter a valid NMC PIN (e.g., 12A3456B)'),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(5, 'Please enter your full name as registered with the NMC'),
  consent: z.boolean().refine((val) => val === true, 'You must consent to credential verification'),
});

export type NMCVerificationFormData = z.infer<typeof nmcVerificationSchema>;

export const firstAidCertificateSchema = z.object({
  certificateType: z.enum(['st_john_ambulance', 'british_red_cross', 'hse_first_aid_at_work', 'other'], {
    message: 'Please select a certificate type',
  }),
  certificateNumber: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((val) => new Date(val) > new Date(), 'Certificate must not be expired'),
});

export type FirstAidCertificateFormData = z.infer<typeof firstAidCertificateSchema>;
