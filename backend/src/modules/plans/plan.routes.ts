import { Router } from 'express';
import { PlanController } from './plan.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

// Public / Authenticated read routes
router.get('/', PlanController.getAll);
router.get('/:id', PlanController.getById);

// Admin restricted modifications
router.post('/', authenticate, authorize(UserRole.ADMIN), PlanController.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), PlanController.update);
router.patch('/:id/toggle-active', authenticate, authorize(UserRole.ADMIN), PlanController.toggleActive);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), PlanController.delete);

export { router as planRoutes };
export default router;
