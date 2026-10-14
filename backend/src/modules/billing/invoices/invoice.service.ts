import { prisma } from '../../../config/database';
import { InvoiceStatus, UserRole } from '@prisma/client';
import { NotFoundError, ConflictError, BusinessRuleError, ForbiddenError } from '../../../shared/errors';
import { generateInvoiceNumber } from '../../../shared/numberGenerator';
import { calculateItemTotal } from '../../../shared/financial';
import { CreateInvoiceInput, UpdateInvoiceInput } from './invoice.schema';
import { AuditService } from '../audit/audit.service';

export class InvoiceService {
  /**
   * Serializes BigInt values in invoices and items to numbers for JSON responses.
   */
  public static serializeInvoice(invoice: any): any {
    if (!invoice) return invoice;
    return {
      ...invoice,
      subtotalPaisa: Number(invoice.subtotalPaisa),
      taxPaisa: Number(invoice.taxPaisa),
      discountPaisa: Number(invoice.discountPaisa),
      totalPaisa: Number(invoice.totalPaisa),
      paidPaisa: Number(invoice.paidPaisa),
      balancePaisa: Number(invoice.totalPaisa - invoice.paidPaisa),
      items: invoice.items?.map((item: any) => ({
        ...item,
        unitPricePaisa: Number(item.unitPricePaisa),
        taxPaisa: Number(item.taxPaisa),
        discountPaisa: Number(item.discountPaisa),
        totalPaisa: Number(item.totalPaisa),
      })),
      payments: invoice.payments?.map((payment: any) => ({
        ...payment,
        amountPaisa: Number(payment.amountPaisa),
      })),
    };
  }

  /**
   * Creates a new invoice with line items in a database transaction.
   */
  public static async create(input: CreateInvoiceInput, createdByUserId: string) {
    const member = await prisma.member.findUnique({
      where: { id: input.memberId },
      include: { user: true },
    });
    if (!member) throw new NotFoundError('Member not found');
    if (!member.isActive) throw new BusinessRuleError('Cannot issue invoices to inactive members');

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate item and invoice totals
    let calculatedSubtotal = 0n;
    let calculatedTax = 0n;
    let calculatedDiscount = 0n;
    let calculatedTotal = 0n;

    const processedItems = input.items.map((item) => {
      const { subtotalPaisa, taxPaisa, discountPaisa, totalPaisa } = calculateItemTotal(
        BigInt(item.unitPricePaisa),
        item.quantity,
        item.taxRateBps,
        BigInt(item.discountPaisa)
      );

      calculatedSubtotal += subtotalPaisa;
      calculatedTax += taxPaisa;
      calculatedDiscount += discountPaisa;
      calculatedTotal += totalPaisa;

      return {
        membershipId: item.membershipId || null,
        description: item.description.trim(),
        quantity: item.quantity,
        unitPricePaisa: BigInt(item.unitPricePaisa),
        taxRateBps: item.taxRateBps,
        taxPaisa,
        discountPaisa,
        totalPaisa,
      };
    });

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber,
          memberId: input.memberId,
          status: InvoiceStatus.DRAFT,
          subtotalPaisa: calculatedSubtotal,
          taxPaisa: calculatedTax,
          discountPaisa: calculatedDiscount,
          totalPaisa: calculatedTotal,
          paidPaisa: 0n,
          dueDate: new Date(input.dueDate),
          notes: input.notes?.trim() || null,
          internalNotes: input.internalNotes?.trim() || null,
          createdBy: createdByUserId,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          member: {
            include: { user: { select: { fullName: true, email: true, phone: true } } },
          },
        },
      });

      return created;
    });

    await AuditService.log({
      userId: createdByUserId,
      action: 'INVOICE_CREATED',
      entityType: 'Invoice',
      entityId: invoice.id,
      newValues: {
        invoiceNumber: invoice.invoiceNumber,
        memberId: invoice.memberId,
        totalPaisa: Number(invoice.totalPaisa),
      },
    });

    return this.serializeInvoice(invoice);
  }

  /**
   * Retrieves an invoice by ID with items, payments, and member profile.
   */
  public static async findById(id: string, user?: { id: string; role: UserRole }) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { receipt: true },
        },
        receipts: true,
        adjustments: true,
        member: {
          include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!invoice) throw new NotFoundError('Invoice not found');

    // Ownership check: Members can only view their own invoices
    if (user && user.role === UserRole.MEMBER && invoice.member.userId !== user.id) {
      throw new ForbiddenError('You can only view your own invoices');
    }

    return this.serializeInvoice(invoice);
  }

  /**
   * Lists invoices with filtering, pagination, and ownership enforcement.
   */
  public static async findAll(
    filters: {
      page?: number;
      limit?: number;
      status?: InvoiceStatus;
      memberId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      overdueOnly?: boolean;
    },
    user?: { id: string; role: UserRole }
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Ownership check for MEMBER role
    if (user && user.role === UserRole.MEMBER) {
      where.member = { userId: user.id };
    } else if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.dueDate = {};
      if (filters.dateFrom) where.dueDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.dueDate.lte = new Date(filters.dateTo);
    }
    if (filters.overdueOnly) {
      where.status = { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] };
      where.dueDate = { lt: new Date() };
    }
    if (filters.search) {
      where.OR = [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { member: { memberCode: { contains: filters.search, mode: 'insensitive' } } },
        { member: { user: { fullName: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            include: { user: { select: { fullName: true, email: true, phone: true } } },
          },
          items: true,
        },
      }),
    ]);

    return {
      invoices: invoices.map((inv) => this.serializeInvoice(inv)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Updates an invoice. Only DRAFT invoices can be edited.
   */
  public static async update(id: string, input: UpdateInvoiceInput, userId: string) {
    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundError('Invoice not found');
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BusinessRuleError('Only invoices in DRAFT status can be modified');
    }

    const invoice = await prisma.$transaction(async (tx) => {
      let updateData: any = {
        notes: input.notes !== undefined ? input.notes?.trim() || null : undefined,
        internalNotes: input.internalNotes !== undefined ? input.internalNotes?.trim() || null : undefined,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      };

      if (input.items && input.items.length > 0) {
        // Delete old items and recalculate
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

        let calculatedSubtotal = 0n;
        let calculatedTax = 0n;
        let calculatedDiscount = 0n;
        let calculatedTotal = 0n;

        const processedItems = input.items.map((item) => {
          const { subtotalPaisa, taxPaisa, discountPaisa, totalPaisa } = calculateItemTotal(
            BigInt(item.unitPricePaisa),
            item.quantity,
            item.taxRateBps,
            BigInt(item.discountPaisa)
          );

          calculatedSubtotal += subtotalPaisa;
          calculatedTax += taxPaisa;
          calculatedDiscount += discountPaisa;
          calculatedTotal += totalPaisa;

          return {
            membershipId: item.membershipId || null,
            description: item.description.trim(),
            quantity: item.quantity,
            unitPricePaisa: BigInt(item.unitPricePaisa),
            taxRateBps: item.taxRateBps,
            taxPaisa,
            discountPaisa,
            totalPaisa,
          };
        });

        updateData = {
          ...updateData,
          subtotalPaisa: calculatedSubtotal,
          taxPaisa: calculatedTax,
          discountPaisa: calculatedDiscount,
          totalPaisa: calculatedTotal,
          items: {
            create: processedItems,
          },
        };
      }

      return tx.invoice.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          member: { include: { user: true } },
        },
      });
    });

    await AuditService.log({
      userId,
      action: 'INVOICE_UPDATED',
      entityType: 'Invoice',
      entityId: id,
      oldValues: { totalPaisa: Number(existing.totalPaisa) },
      newValues: { totalPaisa: Number(invoice.totalPaisa) },
    });

    return this.serializeInvoice(invoice);
  }

  /**
   * Issues an invoice (DRAFT → ISSUED).
   */
  public static async issue(id: string, userId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BusinessRuleError(`Cannot issue an invoice with status ${invoice.status}`);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.ISSUED,
        issuedAt: new Date(),
      },
      include: {
        items: true,
        member: { include: { user: true } },
      },
    });

    await AuditService.log({
      userId,
      action: 'INVOICE_ISSUED',
      entityType: 'Invoice',
      entityId: id,
      newValues: { status: InvoiceStatus.ISSUED, issuedAt: updated.issuedAt },
    });

    return this.serializeInvoice(updated);
  }

  /**
   * Cancels an invoice (DRAFT/ISSUED → CANCELLED).
   */
  public static async cancel(id: string, userId: string, reason?: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.ISSUED) {
      throw new BusinessRuleError(`Cannot cancel an invoice with status ${invoice.status}. Payments may already exist.`);
    }

    if (invoice.paidPaisa > 0n) {
      throw new BusinessRuleError('Cannot cancel an invoice that has received payments. Void or refund instead.');
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        internalNotes: reason ? `${invoice.internalNotes || ''}\nCancellation Reason: ${reason}`.trim() : invoice.internalNotes,
      },
    });

    await AuditService.log({
      userId,
      action: 'INVOICE_CANCELLED',
      entityType: 'Invoice',
      entityId: id,
      newValues: { status: InvoiceStatus.CANCELLED, reason },
    });

    return this.serializeInvoice(updated);
  }

  /**
   * Recalculates an invoice's paid amount from confirmed payments and updates status.
   */
  public static async recalculatePaidAmount(invoiceId: string, tx?: any) {
    const db = tx || prisma;
    const payments = await db.payment.findMany({
      where: {
        invoiceId,
        status: 'CONFIRMED',
      },
      select: { amountPaisa: true },
    });

    const totalPaid = payments.reduce((acc: bigint, p: any) => acc + p.amountPaisa, 0n);

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return;

    let newStatus = invoice.status;
    if (totalPaid >= invoice.totalPaisa) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPaid > 0n) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.PARTIALLY_PAID) {
      newStatus = InvoiceStatus.ISSUED;
    }

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paidPaisa: totalPaid,
        status: newStatus,
      },
    });
  }

  /**
   * Calculates dashboard summary statistics.
   */
  public static async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalInvoicedAgg,
      totalCollectedAgg,
      overdueInvoices,
      todayPaymentsAgg,
      recentInvoices,
      recentPayments,
    ] = await Promise.all([
      // Total Invoiced
      prisma.invoice.aggregate({
        where: { status: { notIn: [InvoiceStatus.CANCELLED, InvoiceStatus.VOID] } },
        _sum: { totalPaisa: true },
      }),
      // Total Collected
      prisma.payment.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { amountPaisa: true },
      }),
      // Overdue Invoices Count & Amount
      prisma.invoice.findMany({
        where: {
          status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
          dueDate: { lt: startOfToday },
        },
        select: { totalPaisa: true, paidPaisa: true },
      }),
      // Today's confirmed collections
      prisma.payment.aggregate({
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: startOfToday },
        },
        _sum: { amountPaisa: true },
      }),
      // Recent invoices (last 5)
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { include: { user: { select: { fullName: true } } } },
        },
      }),
      // Recent payments (last 5)
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { include: { user: { select: { fullName: true } } } },
          invoice: { select: { invoiceNumber: true } },
        },
      }),
    ]);

    const totalInvoicedPaisa = totalInvoicedAgg._sum.totalPaisa || 0n;
    const totalCollectedPaisa = totalCollectedAgg._sum.amountPaisa || 0n;
    const totalOutstandingPaisa =
      totalInvoicedPaisa > totalCollectedPaisa ? totalInvoicedPaisa - totalCollectedPaisa : 0n;

    let overduePaisa = 0n;
    for (const inv of overdueInvoices) {
      overduePaisa += inv.totalPaisa - inv.paidPaisa;
    }

    return {
      totalRevenuePaisa: Number(totalCollectedPaisa),
      totalInvoicedPaisa: Number(totalInvoicedPaisa),
      totalOutstandingPaisa: Number(totalOutstandingPaisa),
      overdueCount: overdueInvoices.length,
      overdueAmountPaisa: Number(overduePaisa),
      todayCollectionsPaisa: Number(todayPaymentsAgg._sum.amountPaisa || 0n),
      recentInvoices: recentInvoices.map((inv) => this.serializeInvoice(inv)),
      recentPayments: recentPayments.map((p) => ({
        ...p,
        amountPaisa: Number(p.amountPaisa),
      })),
    };
  }
}
