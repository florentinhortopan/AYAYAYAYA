import { Router } from 'express';
import { AgentController } from '../controllers/agentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const agentController = new AgentController();

router.use(authenticate);

router.post('/chat', agentController.chatWithAgent);
router.get('/agents', agentController.listAgents);
router.get('/history', agentController.getChatHistory);

export default router;

