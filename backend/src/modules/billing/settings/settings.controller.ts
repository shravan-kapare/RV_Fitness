import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types';
import { SettingsService } from './settings.service';

export class SettingsController {
  public static async getSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getAll();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.update(req.body, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
