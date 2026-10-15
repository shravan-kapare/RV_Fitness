import { Router } from 'express';
import { BenefitController } from './benefit.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', BenefitController.getAll);
router.post('/', authenticate, authorize(UserRole.ADMIN), BenefitController.create);
router.patch('/:id', authenticate, authorize(UserRole.ADMIN), BenefitController.update);

export default router;
