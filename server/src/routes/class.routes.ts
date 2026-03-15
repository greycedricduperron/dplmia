import { Router } from 'express';
import * as ctrl from '../controllers/class.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreateClassSchema, UpdateClassSchema } from '@dplmia/shared';

const router = Router();
router.use(requireAuth);
router.post('/', validate(CreateClassSchema), ctrl.createClass);
router.get('/mine', ctrl.getMyClass);
router.patch('/mine', validate(UpdateClassSchema), ctrl.updateClass);
router.delete('/mine', ctrl.deleteClass);
router.get('/search', ctrl.searchClass);

export default router;
