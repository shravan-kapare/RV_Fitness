import { prisma } from '../../../config/database';
import { ClosingStatus } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../../shared/errors';
import { AuditService } from '../audit/audit.service';

export class DailyClosingService {
  public static serializeClosing(closing: any): any {
    if (!closing) return closing;
    return {
      ...closing,
      totalCollectionsPaisa: Number(closing.totalCollectionsPaisa),
      cashCollectionsPaisa: Number(closing.cashCollectionsPaisa),
      digitalCollectionsPaisa: Number(closing.digitalCollectionsPaisa),
      refundsProcessedPaisa: Number(closing.refundsProcessedPaisa),
      declaredCashPaisa: closing.declaredCashPaisa !== null ? Number(closing.declaredCashPaisa) : null,
      declaredDigitalPaisa: closing.declaredDigitalPaisa !== null ? Number(closing.declaredDigitalPaisa) : null,
      discrepancyPaisa: closing.discrepancyPaisa !== null ? Number(closing.discrepancyPaisa) : null,
    };
  }

  /**
   * Computes the daily collection summary for any date (defaulting to today).
   */
  public static async getSummaryForDate(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const [confirmedPayments, invoicesIssuedCount, invoicesPaidCount, processedRefunds] =
      await Promise.all([
        prisma.payment.findMany({
          where: {
            status: 'CONFIRMED',
            paymentDate: { gte: startOfDay, lte: endOfDay },
          },
          select: { method: true, amountPaisa: true },
        }),
        prisma.invoice.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.invoice.count({
          where: { status: 'PAID', updatedAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.refund.findMany({
          where: {
            status: 'PROCESSED',
            processedAt: { gte: startOfDay, lte: endOfDay },
          },
          select: { amountPaisa: true },
        }),
      ]);

    let cashPaisa = 0n;
    let digitalPaisa = 0n;

    for (const p of confirmedPayments) {
      if (p.method === 'CASH') cashPaisa += p.amountPaisa;
      else digitalPaisa += p.amountPaisa;
    }

    const totalCollectionsPaisa = cashPaisa + digitalPaisa;
    const refundsProcessedPaisa = processedRefunds.reduce((acc, r) => acc + r.amountPaisa, 0n);

    // Check if an existing closing record exists for this date
    const existing = await prisma.dailyCollectionClosing.findUnique({
      where: { closingDate: startOfDay },
      include: { closer: { select: { fullName: true } } },
    });

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCollectionsPaisa: Number(totalCollectionsPaisa),
      cashCollectionsPaisa: Number(cashPaisa),
      digitalCollectionsPaisa: Number(digitalPaisa),
      invoicesIssued: invoicesIssuedCount,
      invoicesPaid: invoicesPaidCount,
      refundsProcessedPaisa: Number(refundsProcessedPaisa),
      existingClosing: existing ? this.serializeClosing(existing) : null,
    };
  }

  /**
   * Finalizes and closes the books for a day.
   */
  public static async closeDay(data: {
    closingDate: string;
    declaredCashPaisa?: number;
    declaredDigitalPaisa?: number;
    notes?: string;
    userId: string;
  }) {
    const summary = await this.getSummaryForDate(data.closingDate);
    const dateObj = new Date(summary.date);

    let declaredTotalPaisa: bigint | null = null;
    let discrepancyPaisa: bigint | null = null;

    if (data.declaredCashPaisa !== undefined && data.declaredDigitalPaisa !== undefined) {
      const declCash = BigInt(data.declaredCashPaisa);
      const declDig = BigInt(data.declaredDigitalPaisa);
      declaredTotalPaisa = declCash + declDig;
      discrepancyPaisa = declaredTotalPaisa - BigInt(summary.totalCollectionsPaisa);
    }

    const closing = await prisma.dailyCollectionClosing.upsert({
      where: { closingDate: dateObj },
      update: {
        totalCollectionsPaisa: BigInt(summary.totalCollectionsPaisa),
        cashCollectionsPaisa: BigInt(summary.cashCollectionsPaisa),
        digitalCollectionsPaisa: BigInt(summary.digitalCollectionsPaisa),
        invoicesIssued: summary.invoicesIssued,
        invoicesPaid: summary.invoicesPaid,
        refundsProcessedPaisa: BigInt(summary.refundsProcessedPaisa),
        declaredCashPaisa: data.declaredCashPaisa !== undefined ? BigInt(data.declaredCashPaisa) : null,
        declaredDigitalPaisa: data.declaredDigitalPaisa !== undefined ? BigInt(data.declaredDigitalPaisa) : null,
        discrepancyPaisa,
        status: ClosingStatus.CLOSED,
        closedBy: data.userId,
        closedAt: new Date(),
        notes: data.notes?.trim() || null,
      },
      create: {
        closingDate: dateObj,
        totalCollectionsPaisa: BigInt(summary.totalCollectionsPaisa),
        cashCollectionsPaisa: BigInt(summary.cashCollectionsPaisa),
        digitalCollectionsPaisa: BigInt(summary.digitalCollectionsPaisa),
        invoicesIssued: summary.invoicesIssued,
        invoicesPaid: summary.invoicesPaid,
        refundsProcessedPaisa: BigInt(summary.refundsProcessedPaisa),
        declaredCashPaisa: data.declaredCashPaisa !== undefined ? BigInt(data.declaredCashPaisa) : null,
        declaredDigitalPaisa: data.declaredDigitalPaisa !== undefined ? BigInt(data.declaredDigitalPaisa) : null,
        discrepancyPaisa,
        status: ClosingStatus.CLOSED,
        closedBy: data.userId,
        closedAt: new Date(),
        notes: data.notes?.trim() || null,
      },
      include: { closer: { select: { fullName: true } } },
    });

    await AuditService.log({
      userId: data.userId,
      action: 'DAILY_COLLECTION_CLOSED',
      entityType: 'DailyCollectionClosing',
      entityId: closing.id,
      newValues: {
        closingDate: summary.date,
        totalCollectionsPaisa: summary.totalCollectionsPaisa,
        discrepancyPaisa: discrepancyPaisa !== null ? Number(discrepancyPaisa) : null,
      },
    });

    return this.serializeClosing(closing);
  }

  public static async findAll() {
    const closings = await prisma.dailyCollectionClosing.findMany({
      orderBy: { closingDate: 'desc' },
      include: { closer: { select: { fullName: true } } },
    });

    return closings.map((c) => this.serializeClosing(c));
  }
}
