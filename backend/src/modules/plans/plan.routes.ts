import { Router } from 'express';
import { PlanController } from './plan.controller';
import { authenticate } from '../../middleware/auth';

export const planRoutes = Router();

planRoutes.use(authenticate);
planRoutes.get('/', PlanController.getPlans);
planRoutes.get('/:id', PlanController.getPlanById);
