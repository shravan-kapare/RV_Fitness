import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './user.schema';

export const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get('/', requireAdmin, UserController.getUsers);
userRoutes.get('/:id', UserController.getUserById);
userRoutes.patch('/:id', validate(updateUserSchema), UserController.updateUser);
