import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/authorize';

export const settingsRoutes = Router();

settingsRoutes.use(authenticate, requireAdmin);
settingsRoutes.get('/', SettingsController.getSettings);
settingsRoutes.patch('/', SettingsController.updateSettings);
