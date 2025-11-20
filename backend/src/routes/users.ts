import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireRegistered } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', requireRegistered, userController.updateProfile);
router.get('/stats', requireRegistered, userController.getStats);
router.get('/achievements', requireRegistered, userController.getAchievements);

export default router;

