import { Router } from 'express';
import { PublicController } from './public.controller';

const router = Router();

router.get('/home', PublicController.getHomeData);
router.get('/plans', PublicController.getPlans);
router.get('/trainers', PublicController.getTrainers);
router.get('/events', PublicController.getEvents);
router.get('/gallery', PublicController.getGallery);
router.get('/offers', PublicController.getOffers);
router.post('/inquiry', PublicController.submitInquiry);

export default router;
