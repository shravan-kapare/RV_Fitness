import { Request, Response, NextFunction } from 'express';
import { BenefitService } from './benefit.service';

export class BenefitController {
  public static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const benefits = await BenefitService.findAll();
      res.status(200).json({ success: true, data: benefits });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const benefit = await BenefitService.create(req.body);
      res.status(201).json({ success: true, data: benefit, message: 'Benefit created' });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const benefit = await BenefitService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: benefit, message: 'Benefit updated' });
    } catch (error) {
      next(error);
    }
  }
}
