import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { AuditService } from './audit.service';

export class AuditController {
  public static async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const entityType = req.query.entityType as string | undefined;
      const action = req.query.action as string | undefined;
      const userId = req.query.userId as string | undefined;

      const result = await AuditService.findAll({ page, limit, entityType, action, userId });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
