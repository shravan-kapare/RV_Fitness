import { Request, Response, NextFunction } from 'express';
import { MembershipService } from './membership.service';
import { AuthenticatedRequest } from '../../types';
import { MembershipStatus } from '@prisma/client';

export class MembershipController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as MembershipStatus | undefined;
      const memberId = req.query.memberId as string | undefined;
      const list = await MembershipService.findAll({ status, memberId });
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const membership = await MembershipService.findById(req.params.id);
      res.status(200).json({ success: true, data: membership });
    } catch (error) {
      next(error);
    }
  }

  public static async assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await MembershipService.assign({
        ...req.body,
        adminUserId: req.user!.id,
      });
      res.status(201).json({ success: true, data: result, message: 'Membership assigned and invoice generated' });
    } catch (error) {
      next(error);
    }
  }

  public static async renew(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await MembershipService.renew(req.params.id, req.user!.id, req.body.notes);
      res.status(200).json({ success: true, data: result, message: 'Membership renewed and invoice generated' });
    } catch (error) {
      next(error);
    }
  }

  public static async freeze(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await MembershipService.freeze(req.params.id, {
        ...req.body,
        adminUserId: req.user!.id,
      });
      res.status(200).json({ success: true, data: updated, message: 'Membership frozen successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async unfreeze(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MembershipService.unfreeze(req.params.id);
      res.status(200).json({ success: true, data: updated, message: 'Membership unfrozen successfully' });
    } catch (error) {
      next(error);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MembershipService.cancel(req.params.id, req.body.reason);
      res.status(200).json({ success: true, data: updated, message: 'Membership cancelled' });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpiring(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const list = await MembershipService.getExpiring(days);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }
}
