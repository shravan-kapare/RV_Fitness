import { z } from 'zod';
import { Gender } from '@prisma/client';

export const createMemberSchema = z.object({
  userId: z.string().uuid('Valid user ID required'),
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  joinDate: z.string().optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ userId: true });

export const memberOnboardingSchema = z.object({
  // Step 1: Personal Info
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.nativeEnum(Gender),
  phone: z.string().optional(),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  address: z.string().optional(),

  // Step 2: Body Measurements
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  bodyFatPct: z.number().optional(),
  chestCm: z.number().optional(),
  waistCm: z.number().optional(),
  armsCm: z.number().optional(),
  thighsCm: z.number().optional(),

  // Step 3: Fitness Profile & Limitations
  goalType: z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'GENERAL_FITNESS']),
  targetWeightKg: z.number().optional(),
  targetDate: z.string().optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional().default('BEGINNER'),
  daysPerWeek: z.number().min(1).max(7).optional().default(5),
  dietaryPreference: z.string().optional(),
  limitations: z.array(z.string()).optional().default([]),

  // Step 4: Training Readiness & PAR-Q
  parqAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must confirm physical activity readiness (PAR-Q) before beginning workouts',
  }),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberOnboardingInput = z.infer<typeof memberOnboardingSchema>;

