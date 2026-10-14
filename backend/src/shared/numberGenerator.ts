import { prisma } from '../config/database';

/**
 * Sequential number generation for financial entities.
 * Format: PREFIX-YYYY-NNNN (e.g. INV-2024-0001)
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  });

  let nextSequence = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function generatePaymentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}-`;

  const lastPayment = await prisma.payment.findFirst({
    where: { paymentNumber: { startsWith: prefix } },
    orderBy: { paymentNumber: 'desc' },
    select: { paymentNumber: true },
  });

  let nextSequence = 1;
  if (lastPayment) {
    const parts = lastPayment.paymentNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RCT-${year}-`;

  const lastReceipt = await prisma.receipt.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: 'desc' },
    select: { receiptNumber: true },
  });

  let nextSequence = 1;
  if (lastReceipt) {
    const parts = lastReceipt.receiptNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function generateRefundNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RFD-${year}-`;

  const lastRefund = await prisma.refund.findFirst({
    where: { refundNumber: { startsWith: prefix } },
    orderBy: { refundNumber: 'desc' },
    select: { refundNumber: true },
  });

  let nextSequence = 1;
  if (lastRefund) {
    const parts = lastRefund.refundNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function generateAdjustmentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ADJ-${year}-`;

  const lastAdjustment = await prisma.financialAdjustment.findFirst({
    where: { adjustmentNumber: { startsWith: prefix } },
    orderBy: { adjustmentNumber: 'desc' },
    select: { adjustmentNumber: true },
  });

  let nextSequence = 1;
  if (lastAdjustment) {
    const parts = lastAdjustment.adjustmentNumber.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}

export async function generateMemberCode(): Promise<string> {
  const prefix = 'RVF-';
  const lastMember = await prisma.member.findFirst({
    where: { memberCode: { startsWith: prefix } },
    orderBy: { memberCode: 'desc' },
    select: { memberCode: true },
  });

  let nextSequence = 1;
  if (lastMember) {
    const parts = lastMember.memberCode.split('-');
    const seq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(seq)) {
      nextSequence = seq + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
}
