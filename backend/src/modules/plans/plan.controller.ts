import { Request, Response, NextFunction } from 'express';
import { PlanService } from './plan.service';

export class PlanController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const publishedOnly = req.query.published === 'true';
      const plans = await PlanService.findAll(publishedOnly);
      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.findById(req.params.id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.create(req.body);
      res.status(201).json({ success: true, data: plan, message: 'Membership plan created successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: plan, message: 'Membership plan updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PlanService.toggleActive(req.params.id);
      res.status(200).json({
        success: true,
        data: plan,
        message: `Plan status changed to ${plan.isActive ? 'ACTIVE' : 'ARCHIVED'}`,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PlanService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
