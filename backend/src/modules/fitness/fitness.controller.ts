import { Request, Response, NextFunction } from 'express';
import { FitnessService } from './fitness.service';
import { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';
import { WorkoutEngineService } from './workout-engine.service';
import { EquipmentService } from './equipment.service';

export class FitnessController {
  // Assessments
  public static async recordAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const assessment = await FitnessService.recordAssessment({
        ...req.body,
        recordedBy: req.user!.id,
      });
      res.status(201).json({ success: true, data: assessment, message: 'Assessment recorded' });
    } catch (error) {
      next(error);
    }
  }

  public static async getMemberAssessments(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await FitnessService.getMemberAssessments(req.params.memberId);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyAssessments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');
      const list = await FitnessService.getMemberAssessments(member.id);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  // Workouts
  public static async getMemberWorkout(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await FitnessService.getMemberWorkout(req.params.memberId);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');
      const plan = await FitnessService.getMemberWorkout(member.id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  public static async createWorkoutPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let trainerId = req.body.trainerId;
      if (!trainerId) {
        const trainer = await prisma.trainer.findUnique({ where: { userId: req.user!.id } });
        if (trainer) trainerId = trainer.id;
      }
      const plan = await FitnessService.createWorkoutPlan({
        ...req.body,
        trainerId,
      });
      res.status(201).json({ success: true, data: plan, message: 'Workout routine assigned' });
    } catch (error) {
      next(error);
    }
  }

  // Diets
  public static async getMemberDiet(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await FitnessService.getMemberDiet(req.params.memberId);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyDiet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');
      const plan = await FitnessService.getMemberDiet(member.id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  public static async createDietPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let trainerId = req.body.trainerId;
      if (!trainerId) {
        const trainer = await prisma.trainer.findUnique({ where: { userId: req.user!.id } });
        if (trainer) trainerId = trainer.id;
      }
      const plan = await FitnessService.createDietPlan({
        ...req.body,
        trainerId,
      });
      res.status(201).json({ success: true, data: plan, message: 'Diet plan assigned' });
    } catch (error) {
      next(error);
    }
  }

  // Goals
  public static async getMyGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');
      const goals = await FitnessService.getMemberGoals(member.id);
      res.status(200).json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  }

  public static async setGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await FitnessService.setGoal(req.body);
      res.status(201).json({ success: true, data: goal, message: 'Goal established' });
    } catch (error) {
      next(error);
    }
  }

  // Workout Scheduling Engine
  public static async getTodayWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');
      const todaySession = await WorkoutEngineService.getTodayWorkoutForMember(member.id);
      res.status(200).json({ success: true, data: todaySession });
    } catch (error) {
      next(error);
    }
  }

  public static async generatePersonalizedWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let memberId = req.body.memberId;
      if (!memberId) {
        const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
        if (!member) throw new NotFoundError('Member profile not found');
        memberId = member.id;
      }
      const plan = await WorkoutEngineService.generatePersonalizedPlan(memberId, req.body);
      res.status(201).json({ success: true, data: plan, message: 'Personalized workout protocol generated' });
    } catch (error) {
      next(error);
    }
  }

  // Equipment Inventory & Capacity Awareness
  public static async listEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, targetMuscle } = req.query as { category?: string; targetMuscle?: string };
      const equipment = await EquipmentService.listEquipment(category, targetMuscle);
      res.status(200).json({ success: true, data: equipment });
    } catch (error) {
      next(error);
    }
  }

  public static async updateEquipmentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;
      const updated = await EquipmentService.updateEquipmentStatus(id, status, notes);
      res.status(200).json({ success: true, data: updated, message: 'Equipment status updated' });
    } catch (error) {
      next(error);
    }
  }
}
