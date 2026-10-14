import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { RefundService } from './refund.service';
import { RefundStatus } from '@prisma/client';

export class RefundController {
  public static async getRefunds(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as RefundStatus | undefined;
      const memberId = req.query.memberId as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      const result = await RefundService.findAll({ page, limit, status, memberId, dateFrom, dateTo });

      res.status(200).json({
        success: true,
        data: result.refunds,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRefundById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const refund = await RefundService.findById(id);
      res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async requestRefund(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refund = await RefundService.request(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Refund requested successfully',
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async approveRefund(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const approved = await RefundService.approve(id, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Refund approved successfully',
        data: approved,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async processRefund(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const referenceNumber = req.body?.referenceNumber;
      const processed = await RefundService.process(id, req.user!.id, referenceNumber);
      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: processed,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async rejectRefund(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const reason = req.body?.reason || 'Refund rejected by administrator';
      const rejected = await RefundService.reject(id, req.user!.id, reason);
      res.status(200).json({
        success: true,
        message: 'Refund rejected successfully',
        data: rejected,
      });
    } catch (error) {
      next(error);
    }
  }
}
