import { Router } from 'express';
import { CareerController } from '../controllers/careerController';
import { authenticate } from '../middleware/auth';

const router = Router();
const careerController = new CareerController();

router.use(authenticate);

router.post('/recommendations', careerController.getRecommendations);
router.get('/paths', careerController.getCareerPaths);
router.get('/paths/:id', careerController.getCareerPath);
router.post('/assessment', careerController.assessInterests);

export default router;

