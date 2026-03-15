import { Router } from 'express';
import * as ctrl from '../controllers/hangman.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { ProposeWordSchema, GuessLetterSchema } from '@dplmia/shared';

const router = Router();
router.use(requireAuth);
router.post('/games', validate(ProposeWordSchema), ctrl.proposeGame);
router.get('/games', ctrl.listGames);
router.get('/games/:id', ctrl.getGame);
router.post('/games/:id/guess', validate(GuessLetterSchema), ctrl.guessLetter);
router.patch('/games/:id/abandon', ctrl.abandonGame);

export default router;
