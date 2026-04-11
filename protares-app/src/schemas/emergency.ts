import { z } from 'zod';

import { EMERGENCY_TYPES, EMERGENCY_SEVERITIES } from '@/lib/constants';

/**
 * Zod schema for reporting a new emergency. The enum values here
 * must match the Postgres enums `emergency_type` and
 * `emergency_severity` — regenerate `src/types/database.types.ts`
 * after any change and update `@/lib/constants` accordingly.
 */

const emergencyTypeEnum = z.enum(
  EMERGENCY_TYPES as unknown as [string, ...string[]]
);
const emergencySeverityEnum = z.enum(
  EMERGENCY_SEVERITIES as unknown as [string, ...string[]]
);

export const reportEmergencySchema = z.object({
  emergencyType: emergencyTypeEnum,
  severity: emergencySeverityEnum,
  description: z.string().max(500).optional(),
  casualtyCount: z.coerce.number().int().min(0).max(20),
  casualtiesConscious: z.boolean().nullable().optional(),
  casualtiesBreathing: z.boolean().nullable().optional(),
  locationDescription: z.string().max(200).optional(),
});

export type ReportEmergencyFormValues = z.infer<typeof reportEmergencySchema>;
