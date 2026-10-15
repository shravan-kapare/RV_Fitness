import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { generateMemberCode } from '../../shared/numberGenerator';
import { CreateMemberInput, UpdateMemberInput, MemberOnboardingInput } from './member.schema';
import { AuditService } from '../billing/audit/audit.service';
import { WorkoutEngineService } from '../fitness/workout-engine.service';

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

  public static async getMemberProfileByUserId(userId: string) {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
        assessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 5,
        },
        fitnessGoals: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        workoutPlans: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!member) throw new NotFoundError('Member profile not found');
    return member;
  }

  public static async getOnboardingStatus(userId: string) {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        assessments: { take: 1 },
        fitnessGoals: { take: 1 },
        user: { select: { fullName: true, email: true, phone: true } },
      },
    });

    if (!member) {
      return { completed: false, isMember: false };
    }

    const completed = member.onboardingCompleted || (
      member.dateOfBirth !== null &&
      member.assessments.length > 0 &&
      member.fitnessGoals.length > 0
    );

    return {
      completed,
      isMember: true,
      memberId: member.id,
      memberCode: member.memberCode,
      user: member.user,
      profile: {
        dateOfBirth: member.dateOfBirth,
        gender: member.gender,
        emergencyContact: member.emergencyContact,
        address: member.address,
      },
    };
  }

  public static async completeOnboarding(userId: string, input: MemberOnboardingInput) {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!member) throw new NotFoundError('Member profile not found for this account');

    const heightM = input.heightCm / 100;
    const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(2));

    const onboardingNotes = JSON.stringify({
      experienceLevel: input.experienceLevel || 'BEGINNER',
      daysPerWeek: input.daysPerWeek || 5,
      dietaryPreference: input.dietaryPreference || 'Standard Balanced',
      limitations: input.limitations || [],
      parqAccepted: input.parqAccepted,
      completedAt: new Date().toISOString(),
    });

    const result = await prisma.$transaction(async (tx) => {
      const updatedMember = await tx.member.update({
        where: { id: member.id },
        data: {
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          emergencyContact: input.emergencyContact.trim(),
          address: input.address?.trim() || member.address,
          notes: onboardingNotes,
          onboardingCompleted: true,
        },
      });

      if (input.phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: input.phone.trim() },
        });
      }

      const assessment = await tx.fitnessAssessment.create({
        data: {
          memberId: member.id,
          recordedBy: userId,
          assessmentDate: new Date(),
          weightKg: input.weightKg,
          heightCm: input.heightCm,
          bmi,
          bodyFatPct: input.bodyFatPct,
          chestCm: input.chestCm,
          waistCm: input.waistCm,
          armsCm: input.armsCm,
          thighsCm: input.thighsCm,
          notes: 'Initial Onboarding Baseline Assessment',
        },
      });

      const goal = await tx.fitnessGoal.create({
        data: {
          memberId: member.id,
          goalType: input.goalType,
          targetValue: input.targetWeightKg ? `${input.targetWeightKg} kg` : undefined,
          targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
          status: 'IN_PROGRESS',
        },
      });

      return { updatedMember, assessment, goal };
    });

    // Automatically generate initial personalized routine with the workout engine
    await WorkoutEngineService.generatePersonalizedPlan(member.id, {
      goalType: input.goalType,
      experienceLevel: input.experienceLevel,
      daysPerWeek: input.daysPerWeek,
      limitations: input.limitations,
    });

    await AuditService.log({
      userId,
      action: 'MEMBER_ONBOARDING_COMPLETED',
      entityType: 'Member',
      entityId: member.id,
      newValues: {
        goalType: input.goalType,
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        bmi,
      },
    });

    return {
      success: true,
      message: 'Onboarding completed successfully! Your personalized workout protocol has been activated.',
      member: result.updatedMember,
      assessment: result.assessment,
      goal: result.goal,
    };
  }
}
