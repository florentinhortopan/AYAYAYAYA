import { Router } from 'express';
import { TrainingController } from '../controllers/trainingController';
import { authenticate } from '../middleware/auth';

const router = Router();
const trainingController = new TrainingController();

router.use(authenticate);

router.get('/programs', trainingController.getPrograms);
router.get('/programs/:id', trainingController.getProgram);
router.get('/mental', trainingController.getMentalTraining);
router.get('/physical', trainingController.getPhysicalTraining);
router.post('/progress', trainingController.trackProgress);

export default router;

