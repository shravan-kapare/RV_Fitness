import { prisma } from '../../config/database';
import { GoalType, GoalStatus } from '@prisma/client';
import { NotFoundError } from '../../shared/errors';

export class FitnessService {
  // ==========================================
  // Assessments
  // ==========================================
  public static async recordAssessment(data: {
    memberId: string;
    recordedBy: string;
    weightKg: number;
    heightCm: number;
    bodyFatPct?: number;
    chestCm?: number;
    waistCm?: number;
    armsCm?: number;
    thighsCm?: number;
    notes?: string;
  }) {
    const heightM = data.heightCm / 100;
    const bmi = Number((data.weightKg / (heightM * heightM)).toFixed(2));

    return prisma.fitnessAssessment.create({
      data: {
        memberId: data.memberId,
        recordedBy: data.recordedBy,
        assessmentDate: new Date(),
        weightKg: data.weightKg,
        heightCm: data.heightCm,
        bmi,
        bodyFatPct: data.bodyFatPct,
        chestCm: data.chestCm,
        waistCm: data.waistCm,
        armsCm: data.armsCm,
        thighsCm: data.thighsCm,
        notes: data.notes,
      },
    });
  }

  public static async getMemberAssessments(memberId: string) {
    return prisma.fitnessAssessment.findMany({
      where: { memberId },
      orderBy: { assessmentDate: 'desc' },
      include: {
        recorder: { select: { fullName: true } },
      },
    });
  }

  // ==========================================
  // Goals
  // ==========================================
  public static async setGoal(data: {
    memberId: string;
    goalType: GoalType;
    targetValue?: string;
    targetDate?: string;
  }) {
    return prisma.fitnessGoal.create({
      data: {
        memberId: data.memberId,
        goalType: data.goalType,
        targetValue: data.targetValue,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        status: GoalStatus.IN_PROGRESS,
      },
    });
  }

  public static async updateGoalStatus(goalId: string, status: GoalStatus) {
    return prisma.fitnessGoal.update({
      where: { id: goalId },
      data: { status },
    });
  }

  public static async getMemberGoals(memberId: string) {
    return prisma.fitnessGoal.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // Workout Plans
  // ==========================================
  public static async getMemberWorkout(memberId: string) {
    return prisma.workoutPlan.findFirst({
      where: { memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        trainer: { include: { user: { select: { fullName: true } } } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            exercises: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });
  }

  public static async createWorkoutPlan(data: {
    memberId: string;
    trainerId: string;
    title: string;
    description?: string;
    startDate?: string;
    days: {
      dayNumber: number;
      dayTitle: string;
      restDay?: boolean;
      exercises?: {
        exerciseName: string;
        sets: number;
        reps: string;
        restSeconds?: number;
        orderIndex?: number;
      }[];
    }[];
  }) {
    return prisma.$transaction(async (tx) => {
      // Archive previous active workout plan for this member
      await tx.workoutPlan.updateMany({
        where: { memberId: data.memberId, isActive: true },
        data: { isActive: false },
      });

      const plan = await tx.workoutPlan.create({
        data: {
          memberId: data.memberId,
          trainerId: data.trainerId,
          title: data.title,
          description: data.description,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          isActive: true,
        },
      });

      for (const d of data.days) {
        const day = await tx.workoutDay.create({
          data: {
            planId: plan.id,
            dayNumber: d.dayNumber,
            dayTitle: d.dayTitle,
            restDay: d.restDay || false,
          },
        });

        if (d.exercises && d.exercises.length > 0) {
          await tx.workoutExercise.createMany({
            data: d.exercises.map((e, idx) => ({
              dayId: day.id,
              exerciseName: e.exerciseName,
              sets: e.sets,
              reps: e.reps,
              restSeconds: e.restSeconds || 90,
              orderIndex: e.orderIndex ?? idx + 1,
            })),
          });
        }
      }

      return tx.workoutPlan.findUnique({
        where: { id: plan.id },
        include: {
          days: {
            include: { exercises: true },
          },
        },
      });
    });
  }

  // ==========================================
  // Diet Plans
  // ==========================================
  public static async getMemberDiet(memberId: string) {
    return prisma.dietPlan.findFirst({
      where: { memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        trainer: { include: { user: { select: { fullName: true } } } },
        meals: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  public static async createDietPlan(data: {
    memberId: string;
    trainerId: string;
    title: string;
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    guidelines?: string;
    meals: {
      mealName: string;
      foodItems: string;
      calories?: number;
      orderIndex?: number;
    }[];
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.dietPlan.updateMany({
        where: { memberId: data.memberId, isActive: true },
        data: { isActive: false },
      });

      const plan = await tx.dietPlan.create({
        data: {
          memberId: data.memberId,
          trainerId: data.trainerId,
          title: data.title,
          dailyCalories: data.dailyCalories,
          proteinGrams: data.proteinGrams,
          carbsGrams: data.carbsGrams,
          fatsGrams: data.fatsGrams,
          guidelines: data.guidelines,
          isActive: true,
        },
      });

      if (data.meals && data.meals.length > 0) {
        await tx.dietMeal.createMany({
          data: data.meals.map((m, idx) => ({
            dietPlanId: plan.id,
            mealName: m.mealName,
            foodItems: m.foodItems,
            calories: m.calories,
            orderIndex: m.orderIndex ?? idx + 1,
          })),
        });
      }

      return tx.dietPlan.findUnique({
        where: { id: plan.id },
        include: { meals: true },
      });
    });
  }
}
