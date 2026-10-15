import { Router } from 'express';
import { TrainerController } from './trainer.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

// Public / Member / Trainer / Admin read routes
router.get('/', TrainerController.getAll);
router.get('/me', authenticate, authorize(UserRole.TRAINER), TrainerController.getMyProfile);
router.get('/:id', TrainerController.getById);

// Admin restricted mutations
router.post('/', authenticate, authorize(UserRole.ADMIN), TrainerController.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), TrainerController.update);
router.patch('/:id/toggle-publish', authenticate, authorize(UserRole.ADMIN), TrainerController.togglePublish);
router.patch('/:id/toggle-available', authenticate, authorize(UserRole.ADMIN), TrainerController.toggleAvailable);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), TrainerController.delete);

export { router as trainerRoutes };
export default router;
