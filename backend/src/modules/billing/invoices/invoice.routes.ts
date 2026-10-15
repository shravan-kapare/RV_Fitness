import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin, authorize } from '../../../middleware/authorize';
import { validate } from '../../../middleware/validate';
import { createInvoiceSchema, updateInvoiceSchema } from './invoice.schema';
import { UserRole } from '@prisma/client';

export const invoiceRoutes = Router();

invoiceRoutes.use(authenticate);

invoiceRoutes.get('/dashboard-stats', requireAdmin, InvoiceController.getDashboardStats);
invoiceRoutes.get('/dashboard', requireAdmin, InvoiceController.getDashboardStats);
invoiceRoutes.get('/', authorize(UserRole.ADMIN, UserRole.MEMBER), InvoiceController.getInvoices);
invoiceRoutes.get('/:id', authorize(UserRole.ADMIN, UserRole.MEMBER), InvoiceController.getInvoiceById);
invoiceRoutes.post('/', requireAdmin, validate(createInvoiceSchema), InvoiceController.createInvoice);
invoiceRoutes.patch('/:id', requireAdmin, validate(updateInvoiceSchema), InvoiceController.updateInvoice);
invoiceRoutes.post('/:id/issue', requireAdmin, InvoiceController.issueInvoice);
invoiceRoutes.post('/:id/cancel', requireAdmin, InvoiceController.cancelInvoice);
