import { Router } from 'express';
import * as ctrl from '../controllers/connection.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);
router.post('/', ctrl.sendInvite);
router.get('/', ctrl.getConnections);
router.get('/pending', ctrl.getPending);
router.patch('/:id/accept', ctrl.accept);
router.patch('/:id/reject', ctrl.reject);
router.delete('/:id', ctrl.remove);

export default router;
