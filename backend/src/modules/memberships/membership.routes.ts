import { Router } from 'express';
import { MembershipController } from './membership.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin & Member read routes
router.get('/', MembershipController.getAll);
router.get('/expiring', authorize(UserRole.ADMIN), MembershipController.getExpiring);
router.get('/:id', MembershipController.getById);

// Admin mutations
router.post('/', authorize(UserRole.ADMIN), MembershipController.assign);
router.post('/:id/renew', authorize(UserRole.ADMIN), MembershipController.renew);
router.post('/:id/freeze', authorize(UserRole.ADMIN), MembershipController.freeze);
router.post('/:id/unfreeze', authorize(UserRole.ADMIN), MembershipController.unfreeze);
router.post('/:id/cancel', authorize(UserRole.ADMIN), MembershipController.cancel);

export default router;
