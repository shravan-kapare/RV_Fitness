import { prisma } from '../../../config/database';
import { RefundStatus, PaymentStatus } from '@prisma/client';
import { NotFoundError, BusinessRuleError } from '../../../shared/errors';
import { generateRefundNumber, generateAdjustmentNumber } from '../../../shared/numberGenerator';
import { RequestRefundInput } from './refund.schema';
import { AuditService } from '../audit/audit.service';
import { InvoiceService } from '../invoices/invoice.service';

export class RefundService {
  public static serializeRefund(refund: any): any {
    if (!refund) return refund;
    return {
      ...refund,
      amountPaisa: Number(refund.amountPaisa),
      payment: refund.payment
        ? {
            ...refund.payment,
            amountPaisa: Number(refund.payment.amountPaisa),
          }
        : undefined,
    };
  }

  /**
   * Calculates total already refunded for a payment.
   */
  public static async getTotalRefundedForPayment(paymentId: string): Promise<bigint> {
    const refunds = await prisma.refund.findMany({
      where: {
        paymentId,
        status: { in: [RefundStatus.REQUESTED, RefundStatus.APPROVED, RefundStatus.PROCESSED] },
      },
      select: { amountPaisa: true },
    });

    return refunds.reduce((acc, r) => acc + r.amountPaisa, 0n);
  }

  /**
   * Requests a refund against a confirmed payment.
   */
  public static async request(input: RequestRefundInput, requestedByUserId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: input.paymentId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundError('Payment not found');

    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new BusinessRuleError(
        `Refunds can only be requested against CONFIRMED payments. Current status: ${payment.status}`
      );
    }

    const refundAmountPaisa = BigInt(input.amountPaisa);
    const alreadyRefunded = await this.getTotalRefundedForPayment(payment.id);
    const maxRefundable = payment.amountPaisa - alreadyRefunded;

    if (refundAmountPaisa > maxRefundable) {
      throw new BusinessRuleError(
        `Requested refund amount of ₹${Number(refundAmountPaisa) / 100} exceeds the remaining refundable amount of ₹${Number(maxRefundable) / 100}`
      );
    }

    const refundNumber = await generateRefundNumber();

    const refund = await prisma.refund.create({
      data: {
        refundNumber,
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        memberId: payment.memberId,
        amountPaisa: refundAmountPaisa,
        reason: input.reason.trim(),
        status: RefundStatus.REQUESTED,
        method: input.method,
        referenceNumber: input.referenceNumber?.trim() || null,
        requestedBy: requestedByUserId,
      },
      include: {
        payment: true,
        member: { include: { user: true } },
      },
    });

    await AuditService.log({
      userId: requestedByUserId,
      action: 'REFUND_REQUESTED',
      entityType: 'Refund',
      entityId: refund.id,
      newValues: {
        refundNumber,
        paymentId: payment.id,
        amountPaisa: Number(refundAmountPaisa),
        reason: input.reason,
      },
    });

    return this.serializeRefund(refund);
  }

  /**
   * Approves a requested refund (REQUESTED → APPROVED).
   */
  public static async approve(id: string, userId: string) {
    const refund = await prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundError('Refund not found');
    if (refund.status !== RefundStatus.REQUESTED) {
      throw new BusinessRuleError(`Only REQUESTED refunds can be approved. Current status: ${refund.status}`);
    }

    const updated = await prisma.refund.update({
      where: { id },
      data: { status: RefundStatus.APPROVED },
      include: { payment: true, member: { include: { user: true } } },
    });

    await AuditService.log({
      userId,
      action: 'REFUND_APPROVED',
      entityType: 'Refund',
      entityId: id,
      newValues: { status: RefundStatus.APPROVED },
    });

    return this.serializeRefund(updated);
  }

  /**
   * Processes an approved refund (APPROVED → PROCESSED).
   * Atomically updates invoice and creates financial adjustment.
   */
  public static async process(id: string, userId: string, referenceNumber?: string) {
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { payment: true, invoice: true },
    });
    if (!refund) throw new NotFoundError('Refund not found');

    if (refund.status !== RefundStatus.APPROVED && refund.status !== RefundStatus.REQUESTED) {
      throw new BusinessRuleError(`Cannot process refund in status ${refund.status}`);
    }

    const adjustmentNumber = await generateAdjustmentNumber();

    const processed = await prisma.$transaction(async (tx) => {
      // 1. Mark refund PROCESSED
      const updatedRefund = await tx.refund.update({
        where: { id },
        data: {
          status: RefundStatus.PROCESSED,
          processedBy: userId,
          processedAt: new Date(),
          referenceNumber: referenceNumber?.trim() || refund.referenceNumber,
        },
        include: { payment: true, member: { include: { user: true } } },
      });

      // 2. Reduce invoice paid amount
      const newPaid = refund.invoice.paidPaisa > refund.amountPaisa ? refund.invoice.paidPaisa - refund.amountPaisa : 0n;
      await tx.invoice.update({
        where: { id: refund.invoiceId },
        data: {
          paidPaisa: newPaid,
          status: newPaid === 0n ? 'ISSUED' : 'PARTIALLY_PAID',
        },
      });

      // 3. Create adjustment
      await tx.financialAdjustment.create({
        data: {
          adjustmentNumber,
          invoiceId: refund.invoiceId,
          type: 'DEBIT',
          amountPaisa: refund.amountPaisa,
          reason: `Refund processed (${refund.refundNumber}): ${refund.reason}`,
          performedBy: userId,
        },
      });

      return updatedRefund;
    });

    await AuditService.log({
      userId,
      action: 'REFUND_PROCESSED',
      entityType: 'Refund',
      entityId: id,
      newValues: { status: RefundStatus.PROCESSED, adjustmentNumber },
    });

    return this.serializeRefund(processed);
  }

  /**
   * Rejects a refund (REQUESTED → REJECTED).
   */
  public static async reject(id: string, userId: string, reason: string) {
    const refund = await prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundError('Refund not found');

    if (refund.status !== RefundStatus.REQUESTED && refund.status !== RefundStatus.APPROVED) {
      throw new BusinessRuleError(`Cannot reject refund with status ${refund.status}`);
    }

    const updated = await prisma.refund.update({
      where: { id },
      data: {
        status: RefundStatus.REJECTED,
        reason: `${refund.reason}\nRejection Reason: ${reason}`.trim(),
      },
      include: { payment: true, member: { include: { user: true } } },
    });

    await AuditService.log({
      userId,
      action: 'REFUND_REJECTED',
      entityType: 'Refund',
      entityId: id,
      newValues: { status: RefundStatus.REJECTED, rejectionReason: reason },
    });

    return this.serializeRefund(updated);
  }

  public static async findById(id: string) {
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        payment: { include: { invoice: true } },
        member: { include: { user: true } },
        requester: { select: { fullName: true } },
        processor: { select: { fullName: true } },
      },
    });
    if (!refund) throw new NotFoundError('Refund not found');
    return this.serializeRefund(refund);
  }

  public static async findAll(filters: {
    page?: number;
    limit?: number;
    status?: RefundStatus;
    memberId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.memberId) where.memberId = filters.memberId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [total, refunds] = await Promise.all([
      prisma.refund.count({ where }),
      prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payment: { select: { paymentNumber: true, method: true } },
          member: { include: { user: { select: { fullName: true } } } },
        },
      }),
    ]);

    return {
      refunds: refunds.map((r) => this.serializeRefund(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
