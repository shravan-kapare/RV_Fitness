import { prisma } from '../../../config/database';
import { AdjustmentType } from '@prisma/client';
import { NotFoundError, BusinessRuleError } from '../../../shared/errors';
import { generateAdjustmentNumber } from '../../../shared/numberGenerator';
import { AuditService } from '../audit/audit.service';

export class AdjustmentService {
  public static serializeAdjustment(adj: any): any {
    if (!adj) return adj;
    return {
      ...adj,
      amountPaisa: Number(adj.amountPaisa),
    };
  }

  public static async create(data: {
    invoiceId: string;
    type: AdjustmentType;
    amountPaisa: number;
    reason: string;
    userId: string;
  }) {
    const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    const adjAmount = BigInt(data.amountPaisa);
    if (adjAmount <= 0n) throw new BusinessRuleError('Adjustment amount must be positive');

    const adjustmentNumber = await generateAdjustmentNumber();

    const adjustment = await prisma.financialAdjustment.create({
      data: {
        adjustmentNumber,
        invoiceId: data.invoiceId,
        type: data.type,
        amountPaisa: adjAmount,
        reason: data.reason.trim(),
        performedBy: data.userId,
      },
      include: {
        performer: { select: { fullName: true } },
        invoice: { select: { invoiceNumber: true } },
      },
    });

    await AuditService.log({
      userId: data.userId,
      action: 'FINANCIAL_ADJUSTMENT_CREATED',
      entityType: 'FinancialAdjustment',
      entityId: adjustment.id,
      newValues: {
        adjustmentNumber,
        type: data.type,
        amountPaisa: data.amountPaisa,
        reason: data.reason,
      },
    });

    return this.serializeAdjustment(adjustment);
  }

  public static async findAll(invoiceId?: string) {
    const where = invoiceId ? { invoiceId } : {};
    const adjustments = await prisma.financialAdjustment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        performer: { select: { fullName: true } },
        invoice: { select: { invoiceNumber: true } },
      },
    });

    return adjustments.map((a) => this.serializeAdjustment(a));
  }
}
