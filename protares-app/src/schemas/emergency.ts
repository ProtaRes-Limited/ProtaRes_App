import { z } from 'zod';

export const reportEmergencySchema = z.object({
  emergencyType: z.enum(
    [
      'cardiac_arrest', 'heart_attack', 'road_accident', 'pedestrian_incident',
      'cyclist_incident', 'stroke', 'diabetic_emergency', 'anaphylaxis',
      'seizure', 'breathing_difficulty', 'stabbing', 'assault',
      'serious_fall', 'choking', 'drowning', 'burn',
      'electrocution', 'overdose', 'other_medical', 'other_trauma',
    ],
    { message: 'Please select an emergency type' }
  ),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  locationDescription: z.string().max(200, 'Description must be less than 200 characters').optional(),
  casualtyCount: z.number().min(1, 'At least 1 casualty').max(99),
  casualtiesConscious: z.boolean().optional(),
  casualtiesBreathing: z.boolean().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type ReportEmergencyFormData = z.infer<typeof reportEmergencySchema>;

export const handoverSchema = z.object({
  handoverTo: z.enum(['ambulance', 'police', 'fire', 'family', 'other'], {
    message: 'Please select who you handed over to',
  }),
  patientConscious: z.boolean(),
  patientBreathing: z.boolean(),
  interventionsSummary: z
    .string()
    .min(10, 'Please provide a brief summary of interventions')
    .max(500, 'Summary must be less than 500 characters'),
  additionalNotes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type HandoverFormData = z.infer<typeof handoverSchema>;
