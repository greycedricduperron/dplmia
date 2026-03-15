import { Router } from 'express';
import * as ctrl from '../controllers/post.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreatePostSchema, CreateCommentSchema } from '@dplmia/shared';
import { uploadImage, uploadAudio } from '../config/multer';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getFeed);
router.get('/gallery', ctrl.getGallery);
router.get('/audio', ctrl.getAudio);

router.post('/posts', validate(CreatePostSchema), ctrl.createTextPost);

router.post('/posts/image', (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: 'Fichier image invalide' });
    next();
  });
}, ctrl.createImagePost);

router.post('/posts/audio', (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: 'Fichier audio invalide' });
    next();
  });
}, ctrl.createAudioPost);

router.delete('/posts/:id', ctrl.deletePost);

router.get('/posts/:postId/comments', ctrl.getComments);
router.post('/posts/:postId/comments', validate(CreateCommentSchema), ctrl.addComment);
router.delete('/posts/:postId/comments/:commentId', ctrl.deleteComment);

export default router;
