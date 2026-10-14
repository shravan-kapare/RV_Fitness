import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { DailyClosingService } from './closing.service';

export class DailyClosingController {
  public static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const summary = await DailyClosingService.getSummaryForDate(date);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async closeDay(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { closingDate, declaredCashPaisa, declaredDigitalPaisa, notes } = req.body;
      const closing = await DailyClosingService.closeDay({
        closingDate,
        declaredCashPaisa,
        declaredDigitalPaisa,
        notes,
        userId: req.user!.id,
      });
      res.status(200).json({
        success: true,
        message: 'Daily collection successfully closed',
        data: closing,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const closings = await DailyClosingService.findAll();
      res.status(200).json({
        success: true,
        data: closings,
      });
    } catch (error) {
      next(error);
    }
  }
}
