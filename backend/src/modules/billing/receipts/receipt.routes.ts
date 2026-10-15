import { Router } from 'express';
import { ReceiptController } from './receipt.controller';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { UserRole } from '@prisma/client';

export const receiptRoutes = Router();

receiptRoutes.use(authenticate);

receiptRoutes.get('/', authorize(UserRole.ADMIN, UserRole.MEMBER), ReceiptController.getReceipts);
receiptRoutes.get('/:id', authorize(UserRole.ADMIN, UserRole.MEMBER), ReceiptController.getReceiptById);
receiptRoutes.get('/:id/pdf', authorize(UserRole.ADMIN, UserRole.MEMBER), ReceiptController.downloadPdf);
