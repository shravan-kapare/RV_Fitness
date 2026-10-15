import { Router } from 'express';
import { MemberController } from './member.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin, authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createMemberSchema, updateMemberSchema, memberOnboardingSchema } from './member.schema';
import { UserRole } from '@prisma/client';

export const memberRoutes = Router();

memberRoutes.use(authenticate);

// Member Self-Service & Onboarding routes (defined before :id)
memberRoutes.get('/me', authorize(UserRole.MEMBER), MemberController.getMyProfile);
memberRoutes.get('/onboarding-status', authorize(UserRole.MEMBER), MemberController.getOnboardingStatus);
memberRoutes.post('/onboarding', authorize(UserRole.MEMBER), validate(memberOnboardingSchema), MemberController.completeOnboarding);

// Admin & Member Lookup routes
memberRoutes.get('/', requireAdmin, MemberController.getMembers);
memberRoutes.get('/:id', MemberController.getMemberById);
memberRoutes.post('/', requireAdmin, validate(createMemberSchema), MemberController.createMember);
memberRoutes.patch('/:id', requireAdmin, validate(updateMemberSchema), MemberController.updateMember);
