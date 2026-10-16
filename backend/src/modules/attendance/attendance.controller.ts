import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors';

export class AttendanceController {
  public static async getMemberQrToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found for this user');

      const tokenData = await AttendanceService.generateQrToken(member.id);
      res.status(200).json({ success: true, data: tokenData });
    } catch (error) {
      next(error);
    }
  }

  public static async scanQr(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await AttendanceService.scanAndCheckIn(token, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async manualCheckIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { memberCode, memberId, notes } = req.body;
      const result = await AttendanceService.manualCheckIn({
        memberCode,
        memberId,
        verifiedBy: req.user!.id,
        notes,
      });
      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const report = await AttendanceService.getDailyReport(date);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const member = await prisma.member.findUnique({ where: { userId: req.user!.id } });
      if (!member) throw new NotFoundError('Member profile not found');

      const history = await AttendanceService.getMemberHistory(member.id);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  public static async getMemberHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await AttendanceService.getMemberHistory(req.params.memberId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  public static async searchHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      const result = await AttendanceService.searchHistory({ page, limit, search, dateFrom, dateTo });
      res.status(200).json({
        success: true,
        data: result.records,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
