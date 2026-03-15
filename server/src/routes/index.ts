import { Router } from 'express';
import authRoutes from './auth.routes';
import classRoutes from './class.routes';
import connectionRoutes from './connection.routes';
import feedRoutes from './feed.routes';
import hangmanRoutes from './hangman.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/connections', connectionRoutes);
router.use('/feed', feedRoutes);
router.use('/hangman', hangmanRoutes);

export default router;
