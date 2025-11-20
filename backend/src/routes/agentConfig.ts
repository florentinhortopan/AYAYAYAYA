import { Router } from 'express';
import { AgentConfigController } from '../controllers/agentConfigController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new AgentConfigController();

// Public: Get all active configurations
router.get('/configurations', controller.getAllConfigs);
router.get('/configurations/:agentType', controller.getConfigByType);

// Admin: Manage configurations
router.use(authenticate);

// Admin routes
router.put('/configurations/:agentType', requireAdmin, controller.updateConfig);
router.post('/rag-sources', requireAdmin, controller.createRAGSource);
router.put('/configurations/:agentType/rag-sources', requireAdmin, controller.updateAgentRAGSources);

// Authenticated routes (non-admin)
router.get('/rag-sources', controller.getAllRAGSources);

export default router;

