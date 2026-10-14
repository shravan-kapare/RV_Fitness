import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { ReportService } from './report.service';

export class ReportController {
  public static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const summary = await ReportService.getSummary(dateFrom, dateTo);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCollections(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const collections = await ReportService.getCollectionsByMethod(dateFrom, dateTo);
      res.status(200).json({
        success: true,
        data: collections,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getOutstandingAging(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const aging = await ReportService.getOutstandingAging();
      res.status(200).json({
        success: true,
        data: aging,
      });
    } catch (error) {
      next(error);
    }
  }
}
