import { prisma } from '../../../config/database';
import { ReconciliationStatus } from '@prisma/client';
import { NotFoundError } from '../../../shared/errors';
import { AuditService } from '../audit/audit.service';

export class ReconciliationService {
  public static serializeReconciliation(rec: any): any {
    if (!rec) return rec;
    return {
      ...rec,
      recordedCashPaisa: Number(rec.recordedCashPaisa),
      recordedUpiPaisa: Number(rec.recordedUpiPaisa),
      recordedCardPaisa: Number(rec.recordedCardPaisa),
      recordedBankPaisa: Number(rec.recordedBankPaisa),
      recordedOtherPaisa: Number(rec.recordedOtherPaisa),
      recordedTotalPaisa: Number(rec.recordedTotalPaisa),
      declaredCashPaisa: rec.declaredCashPaisa !== null ? Number(rec.declaredCashPaisa) : null,
      declaredDigitalPaisa: rec.declaredDigitalPaisa !== null ? Number(rec.declaredDigitalPaisa) : null,
      declaredTotalPaisa: rec.declaredTotalPaisa !== null ? Number(rec.declaredTotalPaisa) : null,
      discrepancyPaisa: rec.discrepancyPaisa !== null ? Number(rec.discrepancyPaisa) : null,
    };
  }

  /**
   * Generates or records a reconciliation statement for a specified date.
   */
  public static async create(data: {
    reconciliationDate: string;
    declaredCashPaisa?: number;
    declaredDigitalPaisa?: number;
    notes?: string;
    userId: string;
  }) {
    const recDate = new Date(data.reconciliationDate);
    const startOfDay = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());
    const endOfDay = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate(), 23, 59, 59, 999);

    // Sum recorded payments by method for this date
    const payments = await prisma.payment.findMany({
      where: {
        status: 'CONFIRMED',
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { method: true, amountPaisa: true },
    });

    let cashPaisa = 0n;
    let upiPaisa = 0n;
    let cardPaisa = 0n;
    let bankPaisa = 0n;
    let otherPaisa = 0n;

    for (const p of payments) {
      if (p.method === 'CASH') cashPaisa += p.amountPaisa;
      else if (p.method === 'UPI') upiPaisa += p.amountPaisa;
      else if (p.method === 'CARD') cardPaisa += p.amountPaisa;
      else if (p.method === 'BANK_TRANSFER') bankPaisa += p.amountPaisa;
      else otherPaisa += p.amountPaisa;
    }

    const recordedTotalPaisa = cashPaisa + upiPaisa + cardPaisa + bankPaisa + otherPaisa;

    let declaredTotalPaisa: bigint | null = null;
    let discrepancyPaisa: bigint | null = null;
    let status: ReconciliationStatus = ReconciliationStatus.PENDING;

    if (data.declaredCashPaisa !== undefined && data.declaredDigitalPaisa !== undefined) {
      const declCash = BigInt(data.declaredCashPaisa);
      const declDig = BigInt(data.declaredDigitalPaisa);
      declaredTotalPaisa = declCash + declDig;
      discrepancyPaisa = declaredTotalPaisa - recordedTotalPaisa;

      status = discrepancyPaisa === 0n ? ReconciliationStatus.MATCHED : ReconciliationStatus.DISCREPANCY;
    }

    const rec = await prisma.reconciliationRecord.create({
      data: {
        reconciliationDate: recDate,
        periodStart: startOfDay,
        periodEnd: endOfDay,
        recordedCashPaisa: cashPaisa,
        recordedUpiPaisa: upiPaisa,
        recordedCardPaisa: cardPaisa,
        recordedBankPaisa: bankPaisa,
        recordedOtherPaisa: otherPaisa,
        recordedTotalPaisa,
        declaredCashPaisa: data.declaredCashPaisa !== undefined ? BigInt(data.declaredCashPaisa) : null,
        declaredDigitalPaisa: data.declaredDigitalPaisa !== undefined ? BigInt(data.declaredDigitalPaisa) : null,
        declaredTotalPaisa,
        discrepancyPaisa,
        status,
        notes: data.notes?.trim() || null,
        performedBy: data.userId,
      },
      include: {
        performer: { select: { fullName: true } },
      },
    });

    await AuditService.log({
      userId: data.userId,
      action: 'RECONCILIATION_RECORDED',
      entityType: 'ReconciliationRecord',
      entityId: rec.id,
      newValues: {
        reconciliationDate: data.reconciliationDate,
        recordedTotalPaisa: Number(recordedTotalPaisa),
        discrepancyPaisa: discrepancyPaisa !== null ? Number(discrepancyPaisa) : null,
        status,
      },
    });

    return this.serializeReconciliation(rec);
  }

  public static async resolve(id: string, notes: string, userId: string) {
    const rec = await prisma.reconciliationRecord.findUnique({ where: { id } });
    if (!rec) throw new NotFoundError('Reconciliation record not found');

    const updated = await prisma.reconciliationRecord.update({
      where: { id },
      data: {
        status: ReconciliationStatus.RESOLVED,
        notes: `${rec.notes || ''}\nResolution: ${notes}`.trim(),
      },
      include: { performer: { select: { fullName: true } } },
    });

    await AuditService.log({
      userId,
      action: 'RECONCILIATION_RESOLVED',
      entityType: 'ReconciliationRecord',
      entityId: id,
      newValues: { status: ReconciliationStatus.RESOLVED, notes },
    });

    return this.serializeReconciliation(updated);
  }

  public static async findAll() {
    const records = await prisma.reconciliationRecord.findMany({
      orderBy: { reconciliationDate: 'desc' },
      include: { performer: { select: { fullName: true } } },
    });

    return records.map((r) => this.serializeReconciliation(r));
  }

  public static async findById(id: string) {
    const rec = await prisma.reconciliationRecord.findUnique({
      where: { id },
      include: { performer: { select: { fullName: true } } },
    });
    if (!rec) throw new NotFoundError('Reconciliation record not found');
    return this.serializeReconciliation(rec);
  }

  /**
   * Identifies anomaly alerts: repeated external transaction references.
   */
  public static async findDuplicateReferences() {
    const duplicates = await prisma.$queryRaw<Array<{ reference_number: string; count: bigint }>>`
      SELECT reference_number, COUNT(*) as count
      FROM payments
      WHERE reference_number IS NOT NULL AND reference_number != ''
      GROUP BY reference_number
      HAVING COUNT(*) > 1
    `;

    return duplicates.map((d) => ({
      referenceNumber: d.reference_number,
      count: Number(d.count),
    }));
  }
}
