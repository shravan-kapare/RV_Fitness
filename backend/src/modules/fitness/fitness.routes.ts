import { Router } from 'express';
import { FitnessController } from './fitness.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Member self routes
router.get('/my-assessments', authorize(UserRole.MEMBER), FitnessController.getMyAssessments);
router.get('/my-workout', authorize(UserRole.MEMBER), FitnessController.getMyWorkout);
router.get('/today-workout', authorize(UserRole.MEMBER), FitnessController.getTodayWorkout);
router.get('/my-diet', authorize(UserRole.MEMBER), FitnessController.getMyDiet);
router.get('/my-goals', authorize(UserRole.MEMBER), FitnessController.getMyGoals);

// Equipment capacity & status routes
router.get('/equipment', FitnessController.listEquipment);
router.patch('/equipment/:id/status', authorize(UserRole.ADMIN), FitnessController.updateEquipmentStatus);

// Workout Generation
router.post('/generate-plan', authorize(UserRole.ADMIN, UserRole.TRAINER, UserRole.MEMBER), FitnessController.generatePersonalizedWorkout);

// Trainer & Admin management routes
router.post('/assessments', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.recordAssessment);
router.get('/member/:memberId/assessments', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.getMemberAssessments);

router.post('/workouts', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.createWorkoutPlan);
router.get('/member/:memberId/workout', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.getMemberWorkout);

router.post('/diets', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.createDietPlan);
router.get('/member/:memberId/diet', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.getMemberDiet);

router.post('/goals', authorize(UserRole.ADMIN, UserRole.TRAINER), FitnessController.setGoal);

export default router;
