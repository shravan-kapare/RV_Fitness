import { prisma } from '../../../config/database';
import { PaymentStatus, InvoiceStatus, UserRole } from '@prisma/client';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
} from '../../../shared/errors';
import { generatePaymentNumber, generateReceiptNumber, generateAdjustmentNumber } from '../../../shared/numberGenerator';
import { RecordPaymentInput } from './payment.schema';
import { AuditService } from '../audit/audit.service';
import { InvoiceService } from '../invoices/invoice.service';

export class PaymentService {
  public static serializePayment(payment: any): any {
    if (!payment) return payment;
    return {
      ...payment,
      amountPaisa: Number(payment.amountPaisa),
      invoice: payment.invoice
        ? {
            ...payment.invoice,
            subtotalPaisa: Number(payment.invoice.subtotalPaisa),
            taxPaisa: Number(payment.invoice.taxPaisa),
            totalPaisa: Number(payment.invoice.totalPaisa),
            paidPaisa: Number(payment.invoice.paidPaisa),
          }
        : undefined,
      receipt: payment.receipt
        ? {
            ...payment.receipt,
            amountPaisa: Number(payment.receipt.amountPaisa),
          }
        : undefined,
    };
  }

  /**
   * Records a payment against an invoice with atomicity, validation, idempotency, and receipt generation.
   */
  public static async record(input: RecordPaymentInput, recordedByUserId: string) {
    // 1. Idempotency check
    if (input.idempotencyKey) {
      const existing = await prisma.payment.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: {
          invoice: true,
          member: { include: { user: true } },
          receipt: true,
        },
      });
      if (existing) {
        return this.serializePayment(existing);
      }
    }

    // 2. Fetch invoice and validate payable state
    const invoice = await prisma.invoice.findUnique({
      where: { id: input.invoiceId },
    });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (
      invoice.status !== InvoiceStatus.ISSUED &&
      invoice.status !== InvoiceStatus.PARTIALLY_PAID
    ) {
      throw new BusinessRuleError(
        `Cannot record payment against invoice with status ${invoice.status}. Invoice must be ISSUED or PARTIALLY_PAID.`
      );
    }

    const paymentAmountPaisa = BigInt(input.amountPaisa);
    if (paymentAmountPaisa <= 0n) {
      throw new BusinessRuleError('Payment amount must be greater than zero');
    }

    const remainingBalance = invoice.totalPaisa - invoice.paidPaisa;
    if (paymentAmountPaisa > remainingBalance) {
      throw new BusinessRuleError(
        `Payment amount of ₹${Number(paymentAmountPaisa) / 100} exceeds the remaining invoice balance of ₹${Number(remainingBalance) / 100}`
      );
    }

    const paymentNumber = await generatePaymentNumber();
    const isConfirmed = input.status === PaymentStatus.CONFIRMED;

    // 3. Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Payment
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: input.invoiceId,
          memberId: invoice.memberId,
          amountPaisa: paymentAmountPaisa,
          method: input.method,
          status: input.status,
          referenceNumber: input.referenceNumber?.trim() || null,
          idempotencyKey: input.idempotencyKey || null,
          paymentDate: new Date(input.paymentDate),
          notes: input.notes?.trim() || null,
          recordedBy: recordedByUserId,
          confirmedAt: isConfirmed ? new Date() : null,
        },
      });

      // Create Payment Allocation
      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          amountPaisa: paymentAmountPaisa,
        },
      });

      let receiptRecord = null;

      if (isConfirmed) {
        // Recalculate invoice paid amount and update status
        const newPaidPaisa = invoice.paidPaisa + paymentAmountPaisa;
        const newStatus =
          newPaidPaisa >= invoice.totalPaisa ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paidPaisa: newPaidPaisa,
            status: newStatus,
          },
        });

        // Generate immutable Receipt record
        const receiptNumber = await generateReceiptNumber();
        receiptRecord = await tx.receipt.create({
          data: {
            receiptNumber,
            paymentId: payment.id,
            invoiceId: invoice.id,
            memberId: invoice.memberId,
            amountPaisa: paymentAmountPaisa,
            issuedBy: recordedByUserId,
          },
        });
      }

      return { payment, receipt: receiptRecord };
    });

    await AuditService.log({
      userId: recordedByUserId,
      action: isConfirmed ? 'PAYMENT_RECORDED_AND_CONFIRMED' : 'PAYMENT_RECORDED_PENDING',
      entityType: 'Payment',
      entityId: result.payment.id,
      newValues: {
        paymentNumber: result.payment.paymentNumber,
        amountPaisa: Number(result.payment.amountPaisa),
        method: result.payment.method,
        invoiceId: input.invoiceId,
        receiptNumber: result.receipt?.receiptNumber,
      },
    });

    const fullPayment = await prisma.payment.findUnique({
      where: { id: result.payment.id },
      include: {
        invoice: true,
        member: { include: { user: true } },
        receipt: true,
      },
    });

    return this.serializePayment(fullPayment);
  }

  /**
   * Confirms a pending payment.
   */
  public static async confirm(id: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BusinessRuleError(`Only PENDING payments can be confirmed. Current status: ${payment.status}`);
    }

    const receiptNumber = await generateReceiptNumber();

    const result = await prisma.$transaction(async (tx) => {
      const confirmed = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // Update invoice
      await InvoiceService.recalculatePaidAmount(payment.invoiceId, tx);

      // Create receipt
      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          paymentId: payment.id,
          invoiceId: payment.invoiceId,
          memberId: payment.memberId,
          amountPaisa: payment.amountPaisa,
          issuedBy: userId,
        },
      });

      return { confirmed, receipt };
    });

    await AuditService.log({
      userId,
      action: 'PAYMENT_CONFIRMED',
      entityType: 'Payment',
      entityId: id,
      newValues: { status: PaymentStatus.CONFIRMED, receiptNumber },
    });

    const full = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true, member: { include: { user: true } }, receipt: true },
    });

    return this.serializePayment(full);
  }

  /**
   * Reverses a confirmed payment with financial adjustment.
   */
  public static async reverse(id: string, userId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BusinessRuleError('A reason must be provided for payment reversal');
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new BusinessRuleError(`Only CONFIRMED payments can be reversed. Current status: ${payment.status}`);
    }

    const adjustmentNumber = await generateAdjustmentNumber();

    await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.REVERSED },
      });

      // 2. Recalculate invoice paid amount
      await InvoiceService.recalculatePaidAmount(payment.invoiceId, tx);

      // 3. Create Financial Adjustment record
      await tx.financialAdjustment.create({
        data: {
          adjustmentNumber,
          invoiceId: payment.invoiceId,
          type: 'CORRECTION',
          amountPaisa: payment.amountPaisa,
          reason: `Reversal of payment ${payment.paymentNumber}: ${reason.trim()}`,
          performedBy: userId,
        },
      });
    });

    await AuditService.log({
      userId,
      action: 'PAYMENT_REVERSED',
      entityType: 'Payment',
      entityId: id,
      newValues: { status: PaymentStatus.REVERSED, reason, adjustmentNumber },
    });

    const full = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true, member: { include: { user: true } }, receipt: true },
    });

    return this.serializePayment(full);
  }

  public static async findById(id: string, user?: { id: string; role: UserRole }) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: { items: true },
        },
        member: {
          include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        },
        receipt: true,
        refunds: true,
      },
    });

    if (!payment) throw new NotFoundError('Payment not found');

    if (user && user.role === UserRole.MEMBER && payment.member.userId !== user.id) {
      throw new ForbiddenError('You can only view your own payments');
    }

    return this.serializePayment(payment);
  }

  public static async findAll(
    filters: {
      page?: number;
      limit?: number;
      status?: PaymentStatus;
      method?: any;
      invoiceId?: string;
      memberId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
    user?: { id: string; role: UserRole }
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (user && user.role === UserRole.MEMBER) {
      where.member = { userId: user.id };
    } else if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.status) where.status = filters.status;
    if (filters.method) where.method = filters.method;
    if (filters.invoiceId) where.invoiceId = filters.invoiceId;

    if (filters.dateFrom || filters.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) where.paymentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.paymentDate.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      where.OR = [
        { paymentNumber: { contains: filters.search, mode: 'insensitive' } },
        { referenceNumber: { contains: filters.search, mode: 'insensitive' } },
        { invoice: { invoiceNumber: { contains: filters.search, mode: 'insensitive' } } },
        { member: { memberCode: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: { select: { invoiceNumber: true, status: true, totalPaisa: true } },
          member: { include: { user: { select: { fullName: true, email: true } } } },
          receipt: { select: { id: true, receiptNumber: true } },
        },
      }),
    ]);

    return {
      payments: payments.map((p) => this.serializePayment(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
