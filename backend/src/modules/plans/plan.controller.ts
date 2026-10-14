import { Request, Response, NextFunction } from 'express';
import { PlanService } from './plan.service';

export class PlanController {
  public static async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isActiveOnly = req.query.all !== 'true';
      const plans = await PlanService.findAll(isActiveOnly);
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const plan = await PlanService.findById(id);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }
}
