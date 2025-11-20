-- Agent configurations table
CREATE TABLE IF NOT EXISTS agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Prompt configuration
  system_prompt_template TEXT NOT NULL,
  prompt_variables JSONB DEFAULT '{}',
  
  -- RAG configuration
  rag_enabled BOOLEAN DEFAULT true,
  rag_source_type VARCHAR(50) DEFAULT 'open_notebook', -- open_notebook, custom, none
  rag_source_url VARCHAR(500),
  rag_search_limit INTEGER DEFAULT 5,
  
  -- Output schema (JSON schema)
  output_schema JSONB NOT NULL,
  
  -- UI configuration
  ui_config JSONB DEFAULT '{}', -- Fields, layout, etc.
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_agent_type CHECK (agent_type IN ('career', 'training', 'financial', 'educational', 'recruitment'))
);

-- RAG sources table (for managing multiple RAG sources)
CREATE TABLE IF NOT EXISTS rag_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- open_notebook, pinecone, weaviate, custom
  url VARCHAR(500),
  api_key VARCHAR(500),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent RAG source mappings (many-to-many)
CREATE TABLE IF NOT EXISTS agent_rag_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_config_id UUID REFERENCES agent_configurations(id) ON DELETE CASCADE,
  rag_source_id UUID REFERENCES rag_sources(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1, -- Lower = higher priority
  enabled BOOLEAN DEFAULT true,
  UNIQUE(agent_config_id, rag_source_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_configurations_agent_type ON agent_configurations(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_is_active ON agent_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_rag_sources_type ON rag_sources(type);
CREATE INDEX IF NOT EXISTS idx_agent_rag_sources_agent ON agent_rag_sources(agent_config_id);
CREATE INDEX IF NOT EXISTS idx_agent_rag_sources_rag ON agent_rag_sources(rag_source_id);

-- Insert default configurations for each agent type
INSERT INTO agent_configurations (
  agent_type, name, description, system_prompt_template, output_schema, ui_config
) VALUES
(
  'career',
  'Career Advisor',
  'Provides personalized career path recommendations',
  'You are a Career Advisor Agent for an army recruitment platform. Your role is to help users discover and pursue career paths in the military.

{{#if isRegistered}}
The user has a registered account and has access to full features.
{{else}}
The user is a guest and has limited access. Encourage registration for full features.
{{/if}}

Your responsibilities include:
- Assessing user interests, skills, and goals
- Recommending suitable military career paths
- Explaining career requirements and progression
- Providing personalized guidance for military careers
- Answering questions about different roles and specialties

Be friendly, encouraging, and informative.',
  '{
    "type": "object",
    "properties": {
      "message": {
        "type": "string",
        "description": "Main response message"
      },
      "recommendations": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "careerPath": {"type": "string"},
            "matchScore": {"type": "number"},
            "reasoning": {"type": "string"},
            "requirements": {"type": "array", "items": {"type": "string"}},
            "benefits": {"type": "array", "items": {"type": "string"}}
          }
        }
      },
      "suggestions": {
        "type": "array",
        "items": {"type": "string"}
      }
    },
    "required": ["message"]
  }'::jsonb,
  '{
    "layout": "recommendations",
    "fields": [
      {"name": "message", "type": "text", "label": "Response"},
      {"name": "recommendations", "type": "list", "label": "Career Recommendations", "component": "CareerCard"}
    ]
  }'::jsonb
),
(
  'training',
  'Training Coach',
  'Provides mental and physical training guidance',
  'You are a Training Coach Agent for an army recruitment platform. Your role is to help users prepare mentally and physically for military service.

{{#if isRegistered}}
The user has a registered account and has access to full features.
{{else}}
The user is a guest and has limited access. Encourage registration for full features.
{{/if}}

Your responsibilities include:
- Creating personalized mental training programs
- Designing physical fitness training plans
- Providing motivation and support
- Tracking progress and adjusting programs
- Offering tips on nutrition and recovery',
  '{
    "type": "object",
    "properties": {
      "message": {"type": "string"},
      "trainingPrograms": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "type": {"type": "string", "enum": ["mental", "physical", "combined"]},
            "name": {"type": "string"},
            "duration": {"type": "string"},
            "exercises": {"type": "array", "items": {"type": "string"}}
          }
        }
      },
      "tips": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["message"]
  }'::jsonb,
  '{
    "layout": "programs",
    "fields": [
      {"name": "message", "type": "text"},
      {"name": "trainingPrograms", "type": "list", "component": "TrainingProgramCard"}
    ]
  }'::jsonb
),
(
  'financial',
  'Financial Assistant',
  'Provides financial planning and benefits information',
  'You are a Financial Assistant Agent for an army recruitment platform. Your role is to help users understand military benefits, compensation, and financial planning.',
  '{
    "type": "object",
    "properties": {
      "message": {"type": "string"},
      "benefits": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "category": {"type": "string"},
            "items": {"type": "array", "items": {"type": "string"}}
          }
        }
      },
      "calculations": {
        "type": "object",
        "properties": {
          "estimatedSalary": {"type": "number"},
          "totalBenefits": {"type": "number"}
        }
      }
    },
    "required": ["message"]
  }'::jsonb,
  '{
    "layout": "benefits",
    "fields": [
      {"name": "message", "type": "text"},
      {"name": "benefits", "type": "list", "component": "BenefitsCard"}
    ]
  }'::jsonb
)
ON CONFLICT (agent_type) DO NOTHING;

-- Insert default RAG source (Open Notebook)
INSERT INTO rag_sources (name, type, url, is_active)
VALUES ('Open Notebook (Default)', 'open_notebook', 'http://localhost:8000', true)
ON CONFLICT DO NOTHING;

