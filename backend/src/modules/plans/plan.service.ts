import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export class PlanService {
  public static async findAll(isActiveOnly: boolean = true) {
    const where = isActiveOnly ? { isActive: true } : {};
    const plans = await prisma.membershipPlan.findMany({
      where,
      orderBy: { pricePaisa: 'asc' },
    });

    return plans.map((p) => ({
      ...p,
      pricePaisa: Number(p.pricePaisa),
    }));
  }

  public static async findById(id: string) {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundError('Membership plan not found');
    return {
      ...plan,
      pricePaisa: Number(plan.pricePaisa),
    };
  }

  public static async create(data: {
    name: string;
    description?: string;
    durationDays: number;
    pricePaisa: bigint;
    taxRateBps?: number;
  }) {
    const plan = await prisma.membershipPlan.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        durationDays: data.durationDays,
        pricePaisa: data.pricePaisa,
        taxRateBps: data.taxRateBps || 0,
      },
    });

    return {
      ...plan,
      pricePaisa: Number(plan.pricePaisa),
    };
  }
}
