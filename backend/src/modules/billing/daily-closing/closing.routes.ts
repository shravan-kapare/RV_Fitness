import { Router } from 'express';
import { DailyClosingController } from './closing.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';

export const dailyClosingRoutes = Router();

dailyClosingRoutes.use(authenticate, requireAdmin);

dailyClosingRoutes.get('/summary', DailyClosingController.getSummary);
dailyClosingRoutes.get('/', DailyClosingController.getHistory);
dailyClosingRoutes.post('/close', DailyClosingController.closeDay);
