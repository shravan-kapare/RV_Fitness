import { Router } from 'express';
import { MemberController } from './member.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createMemberSchema, updateMemberSchema } from './member.schema';

export const memberRoutes = Router();

memberRoutes.use(authenticate);

memberRoutes.get('/', requireAdmin, MemberController.getMembers);
memberRoutes.get('/:id', MemberController.getMemberById);
memberRoutes.post('/', requireAdmin, validate(createMemberSchema), MemberController.createMember);
memberRoutes.patch('/:id', requireAdmin, validate(updateMemberSchema), MemberController.updateMember);
