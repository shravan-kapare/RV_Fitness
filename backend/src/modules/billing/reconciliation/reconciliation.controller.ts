import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { ReconciliationService } from './reconciliation.service';

export class ReconciliationController {
  public static async getRecords(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await ReconciliationService.findAll();
      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRecordById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const record = await ReconciliationService.findById(id);
      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createReconciliation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reconciliationDate, declaredCashPaisa, declaredDigitalPaisa, notes } = req.body;
      const record = await ReconciliationService.create({
        reconciliationDate,
        declaredCashPaisa,
        declaredDigitalPaisa,
        notes,
        userId: req.user!.id,
      });
      res.status(201).json({
        success: true,
        message: 'Reconciliation recorded successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resolveDiscrepancy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { notes } = req.body;
      const resolved = await ReconciliationService.resolve(id, notes || 'Discrepancy resolved', req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Discrepancy resolved successfully',
        data: resolved,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDuplicates(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const duplicates = await ReconciliationService.findDuplicateReferences();
      res.status(200).json({
        success: true,
        data: duplicates,
      });
    } catch (error) {
      next(error);
    }
  }
}
