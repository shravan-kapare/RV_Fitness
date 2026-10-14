import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid('Valid invoice ID is required'),
  amountPaisa: z.number().int().min(1, 'Payment amount must be at least 1 paisa'),
  method: z.nativeEnum(PaymentMethod),
  referenceNumber: z.string().optional(),
  paymentDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Valid payment date is required'),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.CONFIRMED),
});

export const paymentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  invoiceId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
