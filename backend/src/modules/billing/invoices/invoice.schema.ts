import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const invoiceItemSchema = z.object({
  membershipId: z.string().uuid().optional().nullable(),
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  unitPricePaisa: z.number().int().min(0, 'Unit price cannot be negative'),
  taxRateBps: z.number().int().min(0).max(10000).default(0),
  discountPaisa: z.number().int().min(0).default(0),
});

export const createInvoiceSchema = z.object({
  memberId: z.string().uuid('Valid member ID is required'),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Valid due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'Invoice must have at least one line item'),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d))).optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const invoiceQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  memberId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  overdueOnly: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
