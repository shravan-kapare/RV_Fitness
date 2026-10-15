import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get('/summary', ExpenseController.getSummary);
router.get('/', ExpenseController.list);
router.post('/', ExpenseController.create);
router.get('/:id', ExpenseController.getById);
router.delete('/:id', ExpenseController.delete);

export default router;
