import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { UserRole } from '@prisma/client';
import { UpdateUserInput } from './user.schema';
import { AuditService } from '../billing/audit/audit.service';

export class UserService {
  public static async findAll(filters: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        memberProfile: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  public static async update(
    id: string,
    data: UpdateUserInput,
    requester: { id: string; role: UserRole }
  ) {
    // Only Admin can change another user's details or change roles
    if (requester.id !== id && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('You can only update your own user profile');
    }
    if (data.role && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only administrators can change user roles');
    }

    const current = await this.findById(id);

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName.trim() }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.role && { role: data.role }),
        ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await AuditService.log({
      userId: requester.id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      oldValues: current,
      newValues: updated,
    });

    return updated;
  }
}
