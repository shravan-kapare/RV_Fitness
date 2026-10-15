import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin, authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import { recordPaymentSchema } from './payment.schema';
import { UserRole } from '@prisma/client';

export const paymentRoutes = Router();

paymentRoutes.use(authenticate);

paymentRoutes.get('/', authorize(UserRole.ADMIN, UserRole.MEMBER), PaymentController.getPayments);
paymentRoutes.get('/:id', authorize(UserRole.ADMIN, UserRole.MEMBER), PaymentController.getPaymentById);
paymentRoutes.post('/', requireAdmin, validate(recordPaymentSchema), PaymentController.recordPayment);
paymentRoutes.post('/:id/confirm', requireAdmin, PaymentController.confirmPayment);
paymentRoutes.post('/:id/reverse', requireAdmin, PaymentController.reversePayment);
