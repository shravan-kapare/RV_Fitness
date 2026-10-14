import { Router } from 'express';
import { RefundController } from './refund.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import { requestRefundSchema } from './refund.schema';

export const refundRoutes = Router();

refundRoutes.use(authenticate, requireAdmin);

refundRoutes.get('/', RefundController.getRefunds);
refundRoutes.get('/:id', RefundController.getRefundById);
refundRoutes.post('/', validate(requestRefundSchema), RefundController.requestRefund);
refundRoutes.post('/:id/approve', RefundController.approveRefund);
refundRoutes.post('/:id/process', RefundController.processRefund);
refundRoutes.post('/:id/reject', RefundController.rejectRefund);
