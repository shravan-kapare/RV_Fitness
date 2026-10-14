import { prisma } from '../../../config/database';
import { InvoiceStatus } from '@prisma/client';

export class ReportService {
  /**
   * Financial summary metrics over an optional date range.
   */
  public static async getSummary(dateFrom?: string, dateTo?: string) {
    const invoiceWhere: any = {
      status: { notIn: [InvoiceStatus.CANCELLED, InvoiceStatus.VOID] },
    };
    const paymentWhere: any = {
      status: 'CONFIRMED',
    };
    const refundWhere: any = {
      status: 'PROCESSED',
    };

    if (dateFrom || dateTo) {
      invoiceWhere.createdAt = {};
      paymentWhere.paymentDate = {};
      refundWhere.processedAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        invoiceWhere.createdAt.gte = from;
        paymentWhere.paymentDate.gte = from;
        refundWhere.processedAt.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        invoiceWhere.createdAt.lte = to;
        paymentWhere.paymentDate.lte = to;
        refundWhere.processedAt.lte = to;
      }
    }

    const [invoicedAgg, collectedAgg, refundedAgg, activeInvoicesCount, paidInvoicesCount] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: invoiceWhere,
          _sum: { totalPaisa: true, subtotalPaisa: true, taxPaisa: true, discountPaisa: true },
        }),
        prisma.payment.aggregate({
          where: paymentWhere,
          _sum: { amountPaisa: true },
        }),
        prisma.refund.aggregate({
          where: refundWhere,
          _sum: { amountPaisa: true },
        }),
        prisma.invoice.count({ where: invoiceWhere }),
        prisma.invoice.count({ where: { ...invoiceWhere, status: InvoiceStatus.PAID } }),
      ]);

    const totalInvoiced = invoicedAgg._sum.totalPaisa || 0n;
    const totalCollected = collectedAgg._sum.amountPaisa || 0n;
    const totalRefunded = refundedAgg._sum.amountPaisa || 0n;
    const netRevenue = totalCollected > totalRefunded ? totalCollected - totalRefunded : 0n;
    const outstanding = totalInvoiced > totalCollected ? totalInvoiced - totalCollected : 0n;

    return {
      totalInvoicedPaisa: Number(totalInvoiced),
      totalCollectedPaisa: Number(totalCollected),
      totalRefundedPaisa: Number(totalRefunded),
      netRevenuePaisa: Number(netRevenue),
      outstandingPaisa: Number(outstanding),
      subtotalPaisa: Number(invoicedAgg._sum.subtotalPaisa || 0n),
      taxPaisa: Number(invoicedAgg._sum.taxPaisa || 0n),
      discountPaisa: Number(invoicedAgg._sum.discountPaisa || 0n),
      invoicesIssuedCount: activeInvoicesCount,
      invoicesPaidCount: paidInvoicesCount,
    };
  }

  /**
   * Breakdown of payments received by method (Cash, UPI, Bank Transfer, Card, Other).
   */
  public static async getCollectionsByMethod(dateFrom?: string, dateTo?: string) {
    const where: any = { status: 'CONFIRMED' };
    if (dateFrom || dateTo) {
      where.paymentDate = {};
      if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
      if (dateTo) where.paymentDate.lte = new Date(dateTo);
    }

    const payments = await prisma.payment.findMany({
      where,
      select: { method: true, amountPaisa: true },
    });

    const breakdown: Record<string, { count: number; totalPaisa: bigint }> = {
      CASH: { count: 0, totalPaisa: 0n },
      UPI: { count: 0, totalPaisa: 0n },
      BANK_TRANSFER: { count: 0, totalPaisa: 0n },
      CARD: { count: 0, totalPaisa: 0n },
      OTHER: { count: 0, totalPaisa: 0n },
    };

    let totalPaisa = 0n;
    for (const p of payments) {
      if (!breakdown[p.method]) {
        breakdown[p.method] = { count: 0, totalPaisa: 0n };
      }
      breakdown[p.method].count += 1;
      breakdown[p.method].totalPaisa += p.amountPaisa;
      totalPaisa += p.amountPaisa;
    }

    return Object.entries(breakdown).map(([method, data]) => ({
      method,
      count: data.count,
      amountPaisa: Number(data.totalPaisa),
      percentage: totalPaisa > 0n ? Number((data.totalPaisa * 10000n) / totalPaisa) / 100 : 0,
    }));
  }

  /**
   * Outstanding balances categorized into aging intervals:
   * Current (not due), 1-30 days, 31-60 days, 61-90 days, 90+ days.
   */
  public static async getOutstandingAging() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
      },
      include: {
        member: {
          include: {
            user: { select: { fullName: true, phone: true, email: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const buckets = {
      current: { count: 0, totalPaisa: 0n, label: 'Current (Not Due)' },
      days1To30: { count: 0, totalPaisa: 0n, label: '1 - 30 Days Overdue' },
      days31To60: { count: 0, totalPaisa: 0n, label: '31 - 60 Days Overdue' },
      days61To90: { count: 0, totalPaisa: 0n, label: '61 - 90 Days Overdue' },
      days90Plus: { count: 0, totalPaisa: 0n, label: '90+ Days Overdue' },
    };

    const detailedInvoices = invoices.map((inv) => {
      const balancePaisa = inv.totalPaisa - inv.paidPaisa;
      const dueDate = new Date(inv.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let bucket: 'current' | 'days1To30' | 'days31To60' | 'days61To90' | 'days90Plus' = 'current';

      if (diffDays <= 0) {
        bucket = 'current';
        buckets.current.count += 1;
        buckets.current.totalPaisa += balancePaisa;
      } else if (diffDays <= 30) {
        bucket = 'days1To30';
        buckets.days1To30.count += 1;
        buckets.days1To30.totalPaisa += balancePaisa;
      } else if (diffDays <= 60) {
        bucket = 'days31To60';
        buckets.days31To60.count += 1;
        buckets.days31To60.totalPaisa += balancePaisa;
      } else if (diffDays <= 90) {
        bucket = 'days61To90';
        buckets.days61To90.count += 1;
        buckets.days61To90.totalPaisa += balancePaisa;
      } else {
        bucket = 'days90Plus';
        buckets.days90Plus.count += 1;
        buckets.days90Plus.totalPaisa += balancePaisa;
      }

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        memberCode: inv.member.memberCode,
        memberName: inv.member.user.fullName,
        memberPhone: inv.member.user.phone,
        totalPaisa: Number(inv.totalPaisa),
        paidPaisa: Number(inv.paidPaisa),
        balancePaisa: Number(balancePaisa),
        dueDate: inv.dueDate,
        daysOverdue: Math.max(0, diffDays),
        status: inv.status,
        bucket,
      };
    });

    const totalOutstanding =
      buckets.current.totalPaisa +
      buckets.days1To30.totalPaisa +
      buckets.days31To60.totalPaisa +
      buckets.days61To90.totalPaisa +
      buckets.days90Plus.totalPaisa;

    return {
      totalOutstandingPaisa: Number(totalOutstanding),
      buckets: {
        current: { ...buckets.current, totalPaisa: Number(buckets.current.totalPaisa) },
        days1To30: { ...buckets.days1To30, totalPaisa: Number(buckets.days1To30.totalPaisa) },
        days31To60: { ...buckets.days31To60, totalPaisa: Number(buckets.days31To60.totalPaisa) },
        days61To90: { ...buckets.days61To90, totalPaisa: Number(buckets.days61To90.totalPaisa) },
        days90Plus: { ...buckets.days90Plus, totalPaisa: Number(buckets.days90Plus.totalPaisa) },
      },
      invoices: detailedInvoices,
    };
  }
}
