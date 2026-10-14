import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';

export const reconciliationRoutes = Router();

reconciliationRoutes.use(authenticate, requireAdmin);

reconciliationRoutes.get('/duplicates', ReconciliationController.getDuplicates);
reconciliationRoutes.get('/', ReconciliationController.getRecords);
reconciliationRoutes.get('/:id', ReconciliationController.getRecordById);
reconciliationRoutes.post('/', ReconciliationController.createReconciliation);
reconciliationRoutes.post('/:id/resolve', ReconciliationController.resolveDiscrepancy);
