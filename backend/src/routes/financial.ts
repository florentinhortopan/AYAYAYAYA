import { Router } from 'express';
import { FinancialController } from '../controllers/financialController';
import { authenticate, requireRegistered } from '../middleware/auth';

const router = Router();
const financialController = new FinancialController();

router.use(authenticate);
router.use(requireRegistered); // Financial info requires registered account

router.get('/benefits', financialController.getBenefits);
router.post('/calculator', financialController.calculateBenefits);
router.get('/planning', financialController.getFinancialPlanning);

export default router;

