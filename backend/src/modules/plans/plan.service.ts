import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export class PlanService {
  public static async findAll(publishedOnly: boolean = false) {
    const where = publishedOnly ? { isPublished: true, isActive: true } : {};
    const plans = await prisma.membershipPlan.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        planBenefits: {
          include: { benefit: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return plans.map((p) => this.serializePlan(p));
  }

  public static async findById(id: string) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
      include: {
        planBenefits: {
          include: { benefit: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    if (!plan) throw new NotFoundError('Membership plan not found');
    return this.serializePlan(plan);
  }

  public static async create(data: {
    name: string;
    slug?: string;
    description?: string;
    durationDays: number;
    pricePaisa: bigint | number;
    promotionalPricePaisa?: bigint | number;
    taxRateBps?: number;
    isPopular?: boolean;
    displayOrder?: number;
    isPublished?: boolean;
    benefitIds?: { benefitId: string; displayOrder?: number; isIncluded?: boolean }[];
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return prisma.$transaction(async (tx) => {
      const plan = await tx.membershipPlan.create({
        data: {
          name: data.name.trim(),
          slug,
          description: data.description?.trim() || null,
          durationDays: data.durationDays,
          pricePaisa: BigInt(data.pricePaisa),
          promotionalPricePaisa: data.promotionalPricePaisa ? BigInt(data.promotionalPricePaisa) : null,
          taxRateBps: data.taxRateBps ?? 1800,
          isPopular: data.isPopular || false,
          displayOrder: data.displayOrder || 0,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
        },
      });

      if (data.benefitIds && data.benefitIds.length > 0) {
        for (let i = 0; i < data.benefitIds.length; i++) {
          const b = data.benefitIds[i];
          await tx.planBenefit.create({
            data: {
              planId: plan.id,
              benefitId: b.benefitId,
              displayOrder: b.displayOrder ?? i + 1,
              isIncluded: b.isIncluded !== undefined ? b.isIncluded : true,
            },
          });
        }
      }

      const created = await tx.membershipPlan.findUnique({
        where: { id: plan.id },
        include: {
          planBenefits: {
            include: { benefit: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return this.serializePlan(created!);
    });
  }

  public static async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    durationDays: number;
    pricePaisa: bigint | number;
    promotionalPricePaisa: bigint | number | null;
    taxRateBps: number;
    isPopular: boolean;
    displayOrder: number;
    isPublished: boolean;
    isActive: boolean;
    benefitIds: { benefitId: string; displayOrder?: number; isIncluded?: boolean }[];
  }>) {
    const existing = await prisma.membershipPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Plan not found');

    return prisma.$transaction(async (tx) => {
      if (data.benefitIds) {
        await tx.planBenefit.deleteMany({ where: { planId: id } });
        for (let i = 0; i < data.benefitIds.length; i++) {
          const b = data.benefitIds[i];
          await tx.planBenefit.create({
            data: {
              planId: id,
              benefitId: b.benefitId,
              displayOrder: b.displayOrder ?? i + 1,
              isIncluded: b.isIncluded !== undefined ? b.isIncluded : true,
            },
          });
        }
      }

      const updated = await tx.membershipPlan.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          durationDays: data.durationDays,
          pricePaisa: data.pricePaisa !== undefined ? BigInt(data.pricePaisa) : undefined,
          promotionalPricePaisa: data.promotionalPricePaisa !== undefined
            ? (data.promotionalPricePaisa ? BigInt(data.promotionalPricePaisa) : null)
            : undefined,
          taxRateBps: data.taxRateBps,
          isPopular: data.isPopular,
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
          isActive: data.isActive,
        },
        include: {
          planBenefits: {
            include: { benefit: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      return this.serializePlan(updated);
    });
  }

  public static async toggleActive(id: string) {
    const existing = await prisma.membershipPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Plan not found');

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
        isPublished: !existing.isActive, // Keep published in sync
      },
      include: {
        planBenefits: {
          include: { benefit: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return this.serializePlan(updated);
  }

  public static async delete(id: string) {
    const existing = await prisma.membershipPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Plan not found');

    // Check for dependent memberships or invoice items
    const [membershipCount, invoiceItemCount] = await Promise.all([
      prisma.membership.count({ where: { planId: id } }),
      prisma.invoiceItem.count({ where: { membership: { planId: id } } }),
    ]);

    if (membershipCount > 0 || invoiceItemCount > 0) {
      // Historical references exist: safely deactivate/archive instead of violating foreign keys
      const archived = await prisma.membershipPlan.update({
        where: { id },
        data: { isActive: false, isPublished: false },
      });
      return {
        success: true,
        archived: true,
        message: `Plan '${existing.name}' has ${membershipCount} linked memberships/invoices and was safely archived/deactivated to preserve financial records.`,
        plan: this.serializePlan(archived),
      };
    }

    // No references: safe to clean up relations and hard-delete
    await prisma.$transaction(async (tx) => {
      await tx.planBenefit.deleteMany({ where: { planId: id } });
      await tx.membershipPlan.delete({ where: { id } });
    });

    return {
      success: true,
      archived: false,
      message: `Plan '${existing.name}' removed successfully.`,
    };
  }

  public static serializePlan(plan: any) {
    const serializedPlanBenefits = (plan.planBenefits || []).map((pb: any) => ({
      ...pb,
      benefit: pb.benefit
        ? {
            ...pb.benefit,
            name: pb.benefit.title,
            title: pb.benefit.title,
          }
        : undefined,
    }));

    return {
      ...plan,
      pricePaisa: Number(plan.pricePaisa),
      promotionalPricePaisa: plan.promotionalPricePaisa ? Number(plan.promotionalPricePaisa) : null,
      planBenefits: serializedPlanBenefits,
      benefits: (plan.planBenefits || []).map((pb: any) => ({
        id: pb.benefit?.id,
        name: pb.benefit?.title,
        title: pb.benefit?.title,
        description: pb.benefit?.description,
        iconName: pb.benefit?.iconName,
        isIncluded: pb.isIncluded,
        displayOrder: pb.displayOrder,
      })),
    };
  }
}
