import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { pool } from '../database/connection';

export class AgentConfigController {
  // Get all agent configurations
  async getAllConfigs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(
        `SELECT 
          ac.*,
          json_agg(
            json_build_object(
              'id', rs.id,
              'name', rs.name,
              'type', rs.type,
              'priority', ars.priority,
              'enabled', ars.enabled
            ) ORDER BY ars.priority
          ) FILTER (WHERE rs.id IS NOT NULL) as rag_sources
         FROM agent_configurations ac
         LEFT JOIN agent_rag_sources ars ON ac.id = ars.agent_config_id AND ars.enabled = true
         LEFT JOIN rag_sources rs ON ars.rag_source_id = rs.id AND rs.is_active = true
         WHERE ac.is_active = true
         GROUP BY ac.id
         ORDER BY ac.agent_type`
      );

      res.json({ configurations: result.rows });
    } catch (error) {
      next(error);
    }
  }

  // Get configuration by agent type
  async getConfigByType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { agentType } = req.params;

      const result = await pool.query(
        `SELECT 
          ac.*,
          json_agg(
            json_build_object(
              'id', rs.id,
              'name', rs.name,
              'type', rs.type,
              'url', rs.url,
              'priority', ars.priority,
              'enabled', ars.enabled
            ) ORDER BY ars.priority
          ) FILTER (WHERE rs.id IS NOT NULL) as rag_sources
         FROM agent_configurations ac
         LEFT JOIN agent_rag_sources ars ON ac.id = ars.agent_config_id
         LEFT JOIN rag_sources rs ON ars.rag_source_id = rs.id
         WHERE ac.agent_type = $1 AND ac.is_active = true
         GROUP BY ac.id`,
        [agentType]
      );

      if (result.rows.length === 0) {
        throw new AppError('Agent configuration not found', 404);
      }

      res.json({ configuration: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Update agent configuration (Admin only)
  async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { agentType } = req.params;
      const {
        name,
        description,
        systemPromptTemplate,
        promptVariables,
        ragEnabled,
        ragSourceType,
        ragSourceUrl,
        ragSearchLimit,
        outputSchema,
        uiConfig,
        isActive
      } = req.body;

      const result = await pool.query(
        `UPDATE agent_configurations SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          system_prompt_template = COALESCE($3, system_prompt_template),
          prompt_variables = COALESCE($4, prompt_variables),
          rag_enabled = COALESCE($5, rag_enabled),
          rag_source_type = COALESCE($6, rag_source_type),
          rag_source_url = COALESCE($7, rag_source_url),
          rag_search_limit = COALESCE($8, rag_search_limit),
          output_schema = COALESCE($9, output_schema),
          ui_config = COALESCE($10, ui_config),
          is_active = COALESCE($11, is_active),
          version = version + 1,
          updated_at = NOW()
         WHERE agent_type = $12
         RETURNING *`,
        [
          name, description, systemPromptTemplate, JSON.stringify(promptVariables),
          ragEnabled, ragSourceType, ragSourceUrl, ragSearchLimit,
          JSON.stringify(outputSchema), JSON.stringify(uiConfig), isActive, agentType
        ]
      );

      if (result.rows.length === 0) {
        throw new AppError('Agent configuration not found', 404);
      }

      res.json({ configuration: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Get all RAG sources
  async getAllRAGSources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(
        'SELECT * FROM rag_sources WHERE is_active = true ORDER BY name'
      );

      res.json({ sources: result.rows });
    } catch (error) {
      next(error);
    }
  }

  // Create RAG source
  async createRAGSource(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, type, url, apiKey, config } = req.body;

      const result = await pool.query(
        `INSERT INTO rag_sources (name, type, url, api_key, config)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, type, url, apiKey, JSON.stringify(config || {})]
      );

      res.status(201).json({ source: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }

  // Update RAG source mapping for agent
  async updateAgentRAGSources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { agentType } = req.params;
      const { ragSourceIds } = req.body; // Array of { id, priority, enabled }

      // Get agent config
      const agentResult = await pool.query(
        'SELECT id FROM agent_configurations WHERE agent_type = $1',
        [agentType]
      );

      if (agentResult.rows.length === 0) {
        throw new AppError('Agent configuration not found', 404);
      }

      const agentConfigId = agentResult.rows[0].id;

      // Delete existing mappings
      await pool.query(
        'DELETE FROM agent_rag_sources WHERE agent_config_id = $1',
        [agentConfigId]
      );

      // Insert new mappings
      if (ragSourceIds && ragSourceIds.length > 0) {
        for (const mapping of ragSourceIds) {
          await pool.query(
            `INSERT INTO agent_rag_sources (agent_config_id, rag_source_id, priority, enabled)
             VALUES ($1, $2, $3, $4)`,
            [agentConfigId, mapping.id, mapping.priority || 1, mapping.enabled !== false]
          );
        }
      }

      res.json({ message: 'RAG sources updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

