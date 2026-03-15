import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { RegisterSchema, LoginSchema } from '@dplmia/shared';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const router = Router();
router.post('/register', limiter, validate(RegisterSchema), register);
router.post('/login', limiter, validate(LoginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
