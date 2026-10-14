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

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
