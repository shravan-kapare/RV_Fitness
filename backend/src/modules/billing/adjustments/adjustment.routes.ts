import { Router } from 'express';
import { AdjustmentController } from './adjustment.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';

export const adjustmentRoutes = Router();

adjustmentRoutes.use(authenticate, requireAdmin);

adjustmentRoutes.get('/', AdjustmentController.getAdjustments);
adjustmentRoutes.post('/', AdjustmentController.createAdjustment);
