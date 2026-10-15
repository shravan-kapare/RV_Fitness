import { Request, Response, NextFunction } from 'express';
import { TrainerService } from './trainer.service';
import { AuthenticatedRequest } from '../../types';

export class TrainerController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const publishedOnly = req.query.published === 'true';
      const trainers = await TrainerService.findAll(publishedOnly);
      res.status(200).json({ success: true, data: trainers });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.findById(req.params.id);
      res.status(200).json({ success: true, data: trainer });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.findByUserId(req.user!.id);
      res.status(200).json({ success: true, data: trainer });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.create(req.body);
      res.status(201).json({ success: true, data: trainer, message: 'Trainer provisioned successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: trainer, message: 'Trainer updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.togglePublish(req.params.id);
      res.status(200).json({
        success: true,
        data: trainer,
        message: `Coach profile is now ${trainer.isPublished ? 'published on public website' : 'hidden from public website'}`,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await TrainerService.toggleAvailable(req.params.id);
      res.status(200).json({
        success: true,
        data: trainer,
        message: `Coach status is now ${trainer.isAvailable ? 'available for client assignments' : 'marked unavailable'}`,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TrainerService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
