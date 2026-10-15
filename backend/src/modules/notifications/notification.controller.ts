import { Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { AuthenticatedRequest } from '../../types';

export class NotificationController {
  public static async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await NotificationService.getUserNotifications(req.user!.id, req.user!.role);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAsRead(req.params.id);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  public static async broadcast(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.createNotification(req.body);
      res.status(201).json({ success: true, data: notification, message: 'Notification dispatched' });
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const list = await NotificationService.getAll();
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }
}
