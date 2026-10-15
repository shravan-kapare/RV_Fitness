import { prisma } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/errors';

export class BenefitService {
  public static async findAll() {
    const list = await prisma.benefit.findMany({
      orderBy: { title: 'asc' },
    });
    return list.map((b) => ({
      ...b,
      name: b.title,
      category: 'ACCESS',
    }));
  }

  public static async create(data: { title?: string; name?: string; description?: string; iconName?: string; category?: string }) {
    const title = (data.title || data.name || '').trim();
    if (!title) {
      throw new ValidationError('Benefit title/name is required');
    }

    const created = await prisma.benefit.create({
      data: {
        title,
        description: data.description?.trim() || null,
        iconName: data.iconName || 'Check',
      },
    });

    return {
      ...created,
      name: created.title,
      category: data.category || 'ACCESS',
    };
  }

  public static async update(id: string, data: { title?: string; description?: string; iconName?: string; isActive?: boolean }) {
    const existing = await prisma.benefit.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Benefit not found');

    return prisma.benefit.update({
      where: { id },
      data,
    });
  }
}
