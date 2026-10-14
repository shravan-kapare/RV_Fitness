import { Router } from 'express';
import { ReceiptController } from './receipt.controller';
import { authenticate } from '../../../middleware/auth';

export const receiptRoutes = Router();

receiptRoutes.use(authenticate);

receiptRoutes.get('/', ReceiptController.getReceipts);
receiptRoutes.get('/:id', ReceiptController.getReceiptById);
receiptRoutes.get('/:id/pdf', ReceiptController.downloadPdf);
