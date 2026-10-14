import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { MemberService } from './member.service';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../../shared/errors';

export class MemberController {
  public static async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const result = await MemberService.findAll({ page, limit, isActive, search });

      res.status(200).json({
        success: true,
        data: result.members,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMemberById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const member = await MemberService.findById(id);

      if (req.user?.role === UserRole.MEMBER && member.userId !== req.user.id) {
        throw new ForbiddenError('You can only view your own member profile');
      }

      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await MemberService.create(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Member profile created successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await MemberService.update(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Member profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
