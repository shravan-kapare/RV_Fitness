import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { AdjustmentService } from './adjustment.service';

export class AdjustmentController {
  public static async getAdjustments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoiceId = req.query.invoiceId as string | undefined;
      const adjustments = await AdjustmentService.findAll(invoiceId);
      res.status(200).json({
        success: true,
        data: adjustments,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createAdjustment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, type, amountPaisa, reason } = req.body;
      const adjustment = await AdjustmentService.create({
        invoiceId,
        type,
        amountPaisa,
        reason,
        userId: req.user!.id,
      });
      res.status(201).json({
        success: true,
        message: 'Financial adjustment recorded successfully',
        data: adjustment,
      });
    } catch (error) {
      next(error);
    }
  }
}
