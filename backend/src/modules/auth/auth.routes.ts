import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema, refreshSchema } from './auth.schema';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';

export const authRoutes = Router();

authRoutes.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
authRoutes.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
authRoutes.post('/refresh', validate(refreshSchema), AuthController.refresh);
authRoutes.get('/me', authenticate, AuthController.me);
authRoutes.post('/logout', authenticate, AuthController.logout);
