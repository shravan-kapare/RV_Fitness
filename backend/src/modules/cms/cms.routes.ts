import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

// Public Read Endpoints
router.get('/events', CmsController.getEvents);
router.get('/gallery', CmsController.getGallery);
router.get('/offers', CmsController.getOffers);
router.post('/inquiries', CmsController.submitInquiry);

// Protected Admin Management Endpoints
router.post('/events', authenticate, authorize(UserRole.ADMIN), CmsController.createEvent);
router.put('/events/:id', authenticate, authorize(UserRole.ADMIN), CmsController.updateEvent);
router.delete('/events/:id', authenticate, authorize(UserRole.ADMIN), CmsController.deleteEvent);

router.post('/gallery', authenticate, authorize(UserRole.ADMIN), CmsController.createGalleryPost);
router.put('/gallery/:id', authenticate, authorize(UserRole.ADMIN), CmsController.updateGalleryPost);
router.delete('/gallery/:id', authenticate, authorize(UserRole.ADMIN), CmsController.deleteGalleryPost);

router.post('/offers', authenticate, authorize(UserRole.ADMIN), CmsController.createOffer);
router.put('/offers/:id', authenticate, authorize(UserRole.ADMIN), CmsController.updateOffer);
router.delete('/offers/:id', authenticate, authorize(UserRole.ADMIN), CmsController.deleteOffer);

router.get('/inquiries', authenticate, authorize(UserRole.ADMIN), CmsController.getInquiries);
router.patch('/inquiries/:id/status', authenticate, authorize(UserRole.ADMIN), CmsController.updateInquiryStatus);

export default router;
