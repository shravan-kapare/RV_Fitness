import { prisma } from '../../config/database';
import { MembershipStatus, InvoiceStatus } from '@prisma/client';
import { NotFoundError, BusinessRuleError } from '../../shared/errors';
import { generateInvoiceNumber } from '../../shared/numberGenerator';

export class MembershipService {
  public static async findAll(filters: { status?: MembershipStatus; memberId?: string }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.memberId) where.memberId = filters.memberId;

    return prisma.membership.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        member: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        plan: true,
        freezes: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  public static async findById(id: string) {
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        member: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        plan: true,
        freezes: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { sentAt: 'desc' } },
      },
    });
    if (!membership) throw new NotFoundError('Membership record not found');
    return membership;
  }

  public static async assign(data: {
    memberId: string;
    planId: string;
    startDate?: string;
    notes?: string;
    adminUserId: string;
  }) {
    const member = await prisma.member.findUnique({ where: { id: data.memberId } });
    if (!member) throw new NotFoundError('Member not found');

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: data.planId },
      include: {
        planBenefits: { include: { benefit: true }, orderBy: { displayOrder: 'asc' } },
      },
    });
    if (!plan) throw new NotFoundError('Membership plan not found');

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);

    // Snapshot plan details at time of purchase
    const planSnapshot = {
      planId: plan.id,
      name: plan.name,
      pricePaisa: Number(plan.pricePaisa),
      durationDays: plan.durationDays,
      taxRateBps: plan.taxRateBps,
      benefits: plan.planBenefits.map((pb) => pb.benefit.title),
      snapshotAt: new Date().toISOString(),
    };

    return prisma.$transaction(async (tx) => {
      const membership = await tx.membership.create({
        data: {
          memberId: data.memberId,
          planId: data.planId,
          planSnapshot,
          startDate,
          endDate,
          status: MembershipStatus.ACTIVE,
          notes: data.notes,
        },
      });

      // Calculate taxes & totals
      const subtotalPaisa = plan.pricePaisa;
      const taxPaisa = (subtotalPaisa * BigInt(plan.taxRateBps)) / 10000n;
      const totalPaisa = subtotalPaisa + taxPaisa;
      const invoiceNumber = await generateInvoiceNumber();

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          memberId: data.memberId,
          status: InvoiceStatus.ISSUED,
          subtotalPaisa,
          taxPaisa,
          discountPaisa: 0n,
          totalPaisa,
          paidPaisa: 0n,
          dueDate: new Date(Date.now() + 7 * 86400000), // Due in 7 days
          issuedAt: new Date(),
          createdBy: data.adminUserId,
          notes: `Membership Enrollment: ${plan.name}`,
          items: {
            create: [
              {
                membershipId: membership.id,
                description: `${plan.name} (${plan.durationDays} Days)`,
                quantity: 1,
                unitPricePaisa: subtotalPaisa,
                taxRateBps: plan.taxRateBps,
                taxPaisa,
                totalPaisa,
              },
            ],
          },
        },
      });

      return { membership, invoice };
    });
  }

  public static async renew(id: string, adminUserId: string, notes?: string) {
    const current = await prisma.membership.findUnique({
      where: { id },
      include: {
        plan: { include: { planBenefits: { include: { benefit: true } } } },
      },
    });
    if (!current) throw new NotFoundError('Membership not found');

    const now = new Date();
    // If expired, start from today; if still active, chain starting from current endDate
    const renewalStart = current.endDate > now ? current.endDate : now;
    const renewalEnd = new Date(renewalStart.getTime() + current.plan.durationDays * 86400000);

    const planSnapshot = {
      planId: current.plan.id,
      name: current.plan.name,
      pricePaisa: Number(current.plan.pricePaisa),
      durationDays: current.plan.durationDays,
      taxRateBps: current.plan.taxRateBps,
      benefits: current.plan.planBenefits.map((pb) => pb.benefit.title),
      snapshotAt: new Date().toISOString(),
    };

    return prisma.$transaction(async (tx) => {
      // Create new renewal membership period without overwriting history
      const newMembership = await tx.membership.create({
        data: {
          memberId: current.memberId,
          planId: current.planId,
          planSnapshot,
          startDate: renewalStart,
          endDate: renewalEnd,
          status: MembershipStatus.ACTIVE,
          notes: notes || `Renewal from membership #${id.slice(0, 8)}`,
        },
      });

      // Issue invoice for renewal
      const subtotalPaisa = current.plan.pricePaisa;
      const taxPaisa = (subtotalPaisa * BigInt(current.plan.taxRateBps)) / 10000n;
      const totalPaisa = subtotalPaisa + taxPaisa;
      const invoiceNumber = await generateInvoiceNumber();

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          memberId: current.memberId,
          status: InvoiceStatus.ISSUED,
          subtotalPaisa,
          taxPaisa,
          discountPaisa: 0n,
          totalPaisa,
          paidPaisa: 0n,
          dueDate: new Date(Date.now() + 5 * 86400000),
          issuedAt: new Date(),
          createdBy: adminUserId,
          notes: `Membership Renewal: ${current.plan.name}`,
          items: {
            create: [
              {
                membershipId: newMembership.id,
                description: `Renewal — ${current.plan.name}`,
                quantity: 1,
                unitPricePaisa: subtotalPaisa,
                taxRateBps: current.plan.taxRateBps,
                taxPaisa,
                totalPaisa,
              },
            ],
          },
        },
      });

      return { membership: newMembership, invoice };
    });
  }

  public static async freeze(id: string, data: {
    startDate: string;
    endDate: string;
    reason: string;
    adminUserId: string;
  }) {
    const membership = await prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundError('Membership not found');
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BusinessRuleError('Only ACTIVE memberships can be frozen');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const freezeDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    if (freezeDays <= 0) throw new BusinessRuleError('Freeze end date must be after start date');
    if (freezeDays > 60) throw new BusinessRuleError('Maximum permitted freeze period is 60 days');

    const extendedEndDate = new Date(membership.endDate.getTime() + freezeDays * 86400000);

    return prisma.$transaction(async (tx) => {
      await tx.membershipFreeze.create({
        data: {
          membershipId: id,
          startDate: start,
          endDate: end,
          reason: data.reason,
          daysExtended: freezeDays,
          approvedBy: data.adminUserId,
        },
      });

      const updated = await tx.membership.update({
        where: { id },
        data: {
          status: MembershipStatus.FROZEN,
          endDate: extendedEndDate,
        },
      });

      return updated;
    });
  }

  public static async unfreeze(id: string) {
    const membership = await prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundError('Membership not found');
    if (membership.status !== MembershipStatus.FROZEN) {
      throw new BusinessRuleError('Membership is not currently frozen');
    }

    return prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.ACTIVE },
    });
  }

  public static async cancel(id: string, reason?: string) {
    const membership = await prisma.membership.findUnique({ where: { id } });
    if (!membership) throw new NotFoundError('Membership not found');

    return prisma.membership.update({
      where: { id },
      data: {
        status: MembershipStatus.CANCELLED,
        notes: reason ? `${membership.notes || ''}\nCancellation: ${reason}`.trim() : membership.notes,
      },
    });
  }

  public static async getExpiring(daysThreshold: number = 30) {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 86400000);

    return prisma.membership.findMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: { gte: now, lte: thresholdDate },
      },
      include: {
        member: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        plan: true,
      },
      orderBy: { endDate: 'asc' },
    });
  }
}
