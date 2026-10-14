import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { UserService } from './user.service';
import { UserRole } from '@prisma/client';

export class UserController {
  public static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const role = req.query.role as UserRole | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const result = await UserService.findAll({ page, limit, role, isActive, search });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await UserService.findById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await UserService.update(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
