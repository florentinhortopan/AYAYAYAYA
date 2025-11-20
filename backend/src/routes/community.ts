import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { authenticate, requireRegistered } from '../middleware/auth';

const router = Router();
const communityController = new CommunityController();

router.use(authenticate);
router.use(requireRegistered); // Community features require registered account

router.get('/posts', communityController.getPosts);
router.post('/posts', communityController.createPost);
router.get('/posts/:id', communityController.getPost);
router.post('/posts/:id/like', communityController.likePost);
router.post('/posts/:id/comment', communityController.commentPost);

export default router;

