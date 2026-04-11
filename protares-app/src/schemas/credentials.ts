import { z } from 'zod';

/**
 * GMC numbers are 7 digits.
 * NMC PINs are 8 characters: 2 digits + 1 letter + 4 digits + 1 letter, e.g. 12A3456B.
 * HCPC numbers are 2 letters + 6 digits.
 */

export const credentialSchema = z.object({
  body: z.enum(['gmc', 'nmc', 'hcpc', 'first_aid']),
  number: z
    .string()
    .trim()
    .min(4, 'Credential number is too short')
    .max(20, 'Credential number is too long'),
  holderName: z
    .string()
    .trim()
    .min(2, 'Holder name is required')
    .max(120, 'Holder name is too long'),
});

export type CredentialFormValues = z.infer<typeof credentialSchema>;

export function validateGmcFormat(num: string): boolean {
  return /^\d{7}$/.test(num.trim());
}

export function validateNmcFormat(num: string): boolean {
  return /^\d{2}[A-Z]\d{4}[A-Z]$/.test(num.trim().toUpperCase());
}

export function validateHcpcFormat(num: string): boolean {
  return /^[A-Z]{2}\d{6}$/.test(num.trim().toUpperCase());
}
