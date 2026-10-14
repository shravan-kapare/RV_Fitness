import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceController {
  public static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as InvoiceStatus | undefined;
      const memberId = req.query.memberId as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const search = req.query.search as string | undefined;
      const overdueOnly = req.query.overdueOnly === 'true';

      const result = await InvoiceService.findAll(
        { page, limit, status, memberId, dateFrom, dateTo, search, overdueOnly },
        req.user
      );

      res.status(200).json({
        success: true,
        data: result.invoices,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const invoice = await InvoiceService.findById(id, req.user);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await InvoiceService.create(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await InvoiceService.update(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async issueInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const issued = await InvoiceService.issue(id, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Invoice issued successfully',
        data: issued,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async cancelInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const reason = req.body?.reason;
      const cancelled = await InvoiceService.cancel(id, req.user!.id, reason);
      res.status(200).json({
        success: true,
        message: 'Invoice cancelled successfully',
        data: cancelled,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDashboardStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await InvoiceService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
