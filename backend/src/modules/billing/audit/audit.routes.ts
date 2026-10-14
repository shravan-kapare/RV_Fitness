import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';
import { AuditController } from './audit.controller';

export const auditRoutes = Router();

auditRoutes.use(authenticate, requireAdmin);
auditRoutes.get('/', AuditController.getLogs);
