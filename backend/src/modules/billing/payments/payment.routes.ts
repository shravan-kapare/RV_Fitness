import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import { recordPaymentSchema } from './payment.schema';

export const paymentRoutes = Router();

paymentRoutes.use(authenticate);

paymentRoutes.get('/', PaymentController.getPayments);
paymentRoutes.get('/:id', PaymentController.getPaymentById);
paymentRoutes.post('/', requireAdmin, validate(recordPaymentSchema), PaymentController.recordPayment);
paymentRoutes.post('/:id/confirm', requireAdmin, PaymentController.confirmPayment);
paymentRoutes.post('/:id/reverse', requireAdmin, PaymentController.reversePayment);
