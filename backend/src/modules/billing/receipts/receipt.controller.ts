import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { ReceiptService } from './receipt.service';

export class ReceiptController {
  public static async getReceipts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const memberId = req.query.memberId as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      const result = await ReceiptService.findAll({ page, limit, memberId, dateFrom, dateTo }, req.user);

      res.status(200).json({
        success: true,
        data: result.receipts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getReceiptById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const receipt = await ReceiptService.findById(id, req.user);
      res.status(200).json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const pdfBuffer = await ReceiptService.generatePdfBuffer(id, req.user);
      const receipt = await ReceiptService.findById(id, req.user);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Receipt-${receipt.receiptNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
