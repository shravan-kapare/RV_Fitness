import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';

import { InvoiceController } from '../invoices/invoice.controller';

export const reportRoutes = Router();

reportRoutes.use(authenticate, requireAdmin);

reportRoutes.get('/dashboard', InvoiceController.getDashboardStats);
reportRoutes.get('/summary', ReportController.getSummary);
reportRoutes.get('/collections', ReportController.getCollections);
reportRoutes.get('/outstanding', ReportController.getOutstandingAging);
