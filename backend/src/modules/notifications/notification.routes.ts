import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// User notification routes
router.get('/my-notifications', NotificationController.getMyNotifications);
router.patch('/:id/read', NotificationController.markRead);
router.post('/mark-all-read', NotificationController.markAllRead);

// Admin broadcast routes
router.get('/all', authorize(UserRole.ADMIN), NotificationController.getAll);
router.post('/broadcast', authorize(UserRole.ADMIN), NotificationController.broadcast);

export default router;
