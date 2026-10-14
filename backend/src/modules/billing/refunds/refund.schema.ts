import { z } from 'zod';
import { RefundStatus, RefundMethod } from '@prisma/client';

export const requestRefundSchema = z.object({
  paymentId: z.string().uuid('Valid payment ID required'),
  amountPaisa: z.number().int().min(1, 'Refund amount must be positive'),
  reason: z.string().min(5, 'Reason for refund must be at least 5 characters'),
  method: z.nativeEnum(RefundMethod).default(RefundMethod.ORIGINAL_METHOD),
  referenceNumber: z.string().optional(),
});

export const refundQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(RefundStatus).optional(),
  memberId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type RequestRefundInput = z.infer<typeof requestRefundSchema>;
export type RefundQueryInput = z.infer<typeof refundQuerySchema>;
