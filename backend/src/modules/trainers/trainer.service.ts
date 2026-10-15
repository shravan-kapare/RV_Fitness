import { prisma } from '../../config/database';
import { UserRole } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { AuthService } from '../auth/auth.service';

export class TrainerService {
  public static async findAll(publishedOnly: boolean = false) {
    return prisma.trainer.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { displayOrder: 'asc' },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        _count: { select: { assignedMembers: true, workoutPlans: true } },
      },
    });
  }

  public static async findById(id: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        assignedMembers: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            memberships: { where: { status: 'ACTIVE' }, take: 1 },
          },
        },
      },
    });
    if (!trainer) throw new NotFoundError('Trainer profile not found');
    return trainer;
  }

  public static async findByUserId(userId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        assignedMembers: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            memberships: { where: { status: 'ACTIVE' }, take: 1 },
            fitnessGoals: { where: { status: 'IN_PROGRESS' }, take: 1 },
          },
        },
      },
    });
    if (!trainer) throw new NotFoundError('Trainer profile not found for this user');
    return trainer;
  }

  public static async create(data: {
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    specialization: string;
    bio?: string;
    experienceYears?: number;
    certifications?: string;
    photoUrl?: string;
    displayOrder?: number;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('A user with this email already exists');

    const passwordHash = await AuthService.hashPassword(data.password || 'Trainer@123456');

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          role: UserRole.TRAINER,
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          bio: data.bio,
          experienceYears: data.experienceYears || 0,
          certifications: data.certifications,
          photoUrl: data.photoUrl,
          displayOrder: data.displayOrder || 0,
        },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
        },
      });

      return trainer;
    });
  }

  public static async update(id: string, data: Partial<{
    fullName: string;
    phone: string;
    specialization: string;
    bio: string;
    experienceYears: number;
    certifications: string;
    photoUrl: string;
    rating: number;
    isAvailable: boolean;
    isPublished: boolean;
    displayOrder: number;
  }>) {
    const existing = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing) throw new NotFoundError('Trainer not found');

    return prisma.$transaction(async (tx) => {
      if (data.fullName || data.phone !== undefined) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            fullName: data.fullName,
            phone: data.phone,
          },
        });
      }

      return tx.trainer.update({
        where: { id },
        data: {
          specialization: data.specialization,
          bio: data.bio,
          experienceYears: data.experienceYears,
          certifications: data.certifications,
          photoUrl: data.photoUrl,
          rating: data.rating,
          isAvailable: data.isAvailable,
          isPublished: data.isPublished,
          displayOrder: data.displayOrder,
        },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
        },
      });
    });
  }

  public static async togglePublish(id: string) {
    const trainer = await prisma.trainer.findUnique({ where: { id } });
    if (!trainer) throw new NotFoundError('Trainer not found');

    return prisma.trainer.update({
      where: { id },
      data: { isPublished: !trainer.isPublished },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });
  }

  public static async toggleAvailable(id: string) {
    const trainer = await prisma.trainer.findUnique({ where: { id } });
    if (!trainer) throw new NotFoundError('Trainer not found');

    return prisma.trainer.update({
      where: { id },
      data: { isAvailable: !trainer.isAvailable },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });
  }

  public static async delete(id: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assignedMembers: true, workoutPlans: true },
        },
        user: true,
      },
    });
    if (!trainer) throw new NotFoundError('Trainer not found');

    const hasMembers = trainer._count.assignedMembers > 0;
    const hasWorkouts = trainer._count.workoutPlans > 0;

    if (hasMembers || hasWorkouts) {
      // Historical references exist: safely deactivate
      await prisma.$transaction(async (tx) => {
        await tx.trainer.update({
          where: { id },
          data: { isAvailable: false, isPublished: false },
        });
        await tx.user.update({
          where: { id: trainer.userId },
          data: { isActive: false },
        });
      });

      return {
        success: true,
        archived: true,
        message: `Coach '${trainer.user.fullName}' has ${trainer._count.assignedMembers} active athlete(s) and ${trainer._count.workoutPlans} workout plan(s). The account was safely deactivated and unpublished to protect athlete records.`,
      };
    }

    // Clean delete
    await prisma.$transaction(async (tx) => {
      await tx.trainer.delete({ where: { id } });
      await tx.user.delete({ where: { id: trainer.userId } });
    });

    return {
      success: true,
      archived: false,
      message: `Coach '${trainer.user.fullName}' removed cleanly from staff roster.`,
    };
  }
}
