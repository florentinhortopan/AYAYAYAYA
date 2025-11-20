import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AgentOrchestrator } from '@army-recruitment/agents';
import { AgentType } from '@army-recruitment/agents';
import { pool } from '../database/connection';

export class AgentController {
  private orchestrator: AgentOrchestrator | null = null;

  private getOrchestrator(): AgentOrchestrator {
    if (!this.orchestrator) {
      this.orchestrator = new AgentOrchestrator();
    }
    return this.orchestrator;
  }

  async chatWithAgent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { agentType, message, conversationId } = req.body;
      
      if (!agentType || !message) {
        return res.status(400).json({ error: 'agentType and message are required' });
      }

      if (!['career', 'training', 'financial', 'educational', 'recruitment'].includes(agentType)) {
        return res.status(400).json({ error: 'Invalid agent type' });
      }

      // Get agent configuration for UI rendering
      const configResult = await pool.query(
        `SELECT ac.*,
          json_agg(
            json_build_object(
              'id', rs.id,
              'name', rs.name,
              'type', rs.type,
              'url', rs.url
            )
          ) FILTER (WHERE rs.id IS NOT NULL) as rag_sources
         FROM agent_configurations ac
         LEFT JOIN agent_rag_sources ars ON ac.id = ars.agent_config_id AND ars.enabled = true
         LEFT JOIN rag_sources rs ON ars.rag_source_id = rs.id AND rs.is_active = true
         WHERE ac.agent_type = $1 AND ac.is_active = true
         GROUP BY ac.id`,
        [agentType]
      );

      const config = configResult.rows[0];

      const context = {
        userId: req.user?.id,
        sessionId: conversationId || req.user?.id,
        isRegistered: req.user?.isRegistered || false,
        conversationHistory: [],
        metadata: {}
      };

      const response = await this.getOrchestrator().routeToAgent(
        agentType as AgentType,
        message,
        context
      );
      
      // Include configuration for UI rendering
      res.json({ 
        response, 
        conversationId: conversationId || req.user?.id,
        config: config ? {
          outputSchema: config.output_schema,
          uiConfig: config.ui_config
        } : null
      });
    } catch (error) {
      next(error);
    }
  }

  async listAgents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const agents = [
        { id: 'career', name: 'Career Advisor', description: 'Get personalized career path recommendations' },
        { id: 'training', name: 'Training Coach', description: 'Mental and physical training guidance' },
        { id: 'financial', name: 'Financial Assistant', description: 'Financial planning and benefits information' },
        { id: 'educational', name: 'Educational Bot', description: 'Interactive learning and knowledge base' },
        { id: 'recruitment', name: 'Recruitment Agent', description: 'General recruitment guidance and FAQ' }
      ];
      
      res.json({ agents });
    } catch (error) {
      next(error);
    }
  }

  async getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations: any[] = [];
      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  }
}

