import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { PaymentService } from './payment.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class PaymentController {
  public static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as PaymentStatus | undefined;
      const method = req.query.method as PaymentMethod | undefined;
      const invoiceId = req.query.invoiceId as string | undefined;
      const memberId = req.query.memberId as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await PaymentService.findAll(
        { page, limit, status, method, invoiceId, memberId, dateFrom, dateTo, search },
        req.user
      );

      res.status(200).json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPaymentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const payment = await PaymentService.findById(id, req.user);
      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await PaymentService.record(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const confirmed = await PaymentService.confirm(id, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: confirmed,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async reversePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const reason = req.body?.reason || 'Payment reversal requested by administrator';
      const reversed = await PaymentService.reverse(id, req.user!.id, reason);
      res.status(200).json({
        success: true,
        message: 'Payment reversed successfully',
        data: reversed,
      });
    } catch (error) {
      next(error);
    }
  }
}
