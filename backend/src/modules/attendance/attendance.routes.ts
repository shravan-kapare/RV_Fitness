import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Member Self-service QR token generator
router.get('/my-qr', authorize(UserRole.MEMBER), AttendanceController.getMemberQrToken);
router.get('/my-history', authorize(UserRole.MEMBER), AttendanceController.getMyHistory);

// Admin / Trainer check-in and scan desk
router.post('/scan', authorize(UserRole.ADMIN, UserRole.TRAINER), AttendanceController.scanQr);
router.post('/manual', authorize(UserRole.ADMIN, UserRole.TRAINER), AttendanceController.manualCheckIn);
router.get('/daily', authorize(UserRole.ADMIN, UserRole.TRAINER), AttendanceController.getDaily);
router.get('/member/:memberId', authorize(UserRole.ADMIN, UserRole.TRAINER), AttendanceController.getMemberHistory);

export default router;
