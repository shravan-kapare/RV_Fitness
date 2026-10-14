import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { generateMemberCode } from '../../shared/numberGenerator';
import { CreateMemberInput, UpdateMemberInput } from './member.schema';
import { AuditService } from '../billing/audit/audit.service';

export class MemberService {
  public static async findAll(filters: {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { memberCode: { contains: filters.search, mode: 'insensitive' } },
        { user: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { phone: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          memberships: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1,
          },
        },
      }),
    ]);

    return {
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async findById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!member) throw new NotFoundError('Member not found');
    return member;
  }

  public static async findByUserId(userId: string) {
    return prisma.member.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  public static async create(input: CreateMemberInput, adminUserId: string) {
    const existing = await prisma.member.findUnique({
      where: { userId: input.userId },
    });
    if (existing) {
      throw new ConflictError('A gym member profile already exists for this user');
    }

    const memberCode = await generateMemberCode();

    const member = await prisma.member.create({
      data: {
        userId: input.userId,
        memberCode,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender,
        address: input.address?.trim() || null,
        emergencyContact: input.emergencyContact?.trim() || null,
        joinDate: input.joinDate ? new Date(input.joinDate) : new Date(),
        photoUrl: input.photoUrl || null,
        notes: input.notes?.trim() || null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    await AuditService.log({
      userId: adminUserId,
      action: 'MEMBER_CREATED',
      entityType: 'Member',
      entityId: member.id,
      newValues: { memberCode, userId: input.userId },
    });

    return member;
  }

  public static async update(id: string, input: UpdateMemberInput, adminUserId: string) {
    const current = await this.findById(id);

    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...(input.dateOfBirth && { dateOfBirth: new Date(input.dateOfBirth) }),
        ...(input.gender && { gender: input.gender }),
        ...(input.address !== undefined && { address: input.address?.trim() || null }),
        ...(input.emergencyContact !== undefined && { emergencyContact: input.emergencyContact?.trim() || null }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
        ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    await AuditService.log({
      userId: adminUserId,
      action: 'MEMBER_UPDATED',
      entityType: 'Member',
      entityId: id,
      oldValues: current,
      newValues: updated,
    });

    return updated;
  }
}
