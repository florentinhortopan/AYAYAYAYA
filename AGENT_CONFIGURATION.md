# Agent Configuration System

## Overview

The agent system is now fully configurable with:
- **Prompt Templates**: Customizable system prompts with variables
- **Structured Output Schemas**: JSON schemas for consistent responses
- **UI Configuration**: Metadata for rendering responses in the frontend
- **RAG Source Selection**: Configure which RAG sources each agent uses
- **Backend Management**: Admin API for managing configurations

## Database Schema

### agent_configurations
Stores configuration for each agent type:
- `agent_type`: career, training, financial, educational, recruitment
- `system_prompt_template`: Template with variables (e.g., `{{isRegistered}}`)
- `output_schema`: JSON schema defining response structure
- `ui_config`: Configuration for UI rendering
- `rag_enabled`: Whether RAG is enabled
- `rag_source_type`: Type of RAG source
- `rag_sources`: Array of configured RAG sources

### rag_sources
Stores available RAG sources:
- `name`: Human-readable name
- `type`: open_notebook, pinecone, weaviate, custom
- `url`: API endpoint
- `api_key`: Authentication key
- `config`: Additional configuration

### agent_rag_sources
Many-to-many mapping between agents and RAG sources:
- `priority`: Search priority (lower = higher priority)
- `enabled`: Whether this source is active for the agent

## API Endpoints

### Get Agent Configuration
```
GET /api/agent-config/configurations/:agentType
```
Returns configuration including RAG sources.

### Get All Configurations
```
GET /api/agent-config/configurations
```
Returns all active agent configurations.

### Update Configuration (Admin)
```
PUT /api/agent-config/configurations/:agentType
Body: {
  name?: string;
  description?: string;
  systemPromptTemplate?: string;
  outputSchema?: JSONSchema;
  uiConfig?: UIConfig;
  ragEnabled?: boolean;
  ...
}
```

### Manage RAG Sources (Admin)
```
GET /api/agent-config/rag-sources
POST /api/agent-config/rag-sources
PUT /api/agent-config/configurations/:agentType/rag-sources
Body: {
  ragSourceIds: [
    { id: "uuid", priority: 1, enabled: true }
  ]
}
```

## Prompt Templates

Prompts support template variables:
- `{{variableName}}`: Simple replacement
- `{{#if variable}}...{{/if}}`: Conditional blocks
- `{{#if variable}}...{{else}}...{{/if}}`: If/else blocks

Available context variables:
- `isRegistered`: Boolean
- `userId`: String
- `sessionId`: String

Example:
```
{{#if isRegistered}}
The user has full access.
{{else}}
The user is a guest. Encourage registration.
{{/if}}
```

## Output Schemas

Each agent has a JSON schema defining its response structure:

```json
{
  "type": "object",
  "properties": {
    "message": { "type": "string" },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "careerPath": { "type": "string" },
          "matchScore": { "type": "number" }
        }
      }
    }
  },
  "required": ["message"]
}
```

## UI Configuration

UI config defines how to render responses:

```json
{
  "layout": "recommendations",
  "fields": [
    {
      "name": "message",
      "type": "text",
      "label": "Response"
    },
    {
      "name": "recommendations",
      "type": "list",
      "label": "Career Recommendations",
      "component": "CareerCard"
    }
  ]
}
```

## Frontend Integration

The agent chat response includes:
```json
{
  "response": {
    "message": "...",
    "data": { /* structured data */ },
    "metadata": { /* metadata */ }
  },
  "config": {
    "outputSchema": { /* JSON schema */ },
    "uiConfig": { /* UI config */ }
  }
}
```

Use `config.uiConfig` to render the structured `data` appropriately.

## Example: Configuring Career Agent

1. **Get current config:**
```bash
GET /api/agent-config/configurations/career
```

2. **Update prompt template:**
```bash
PUT /api/agent-config/configurations/career
{
  "systemPromptTemplate": "You are a Career Advisor...{{#if isRegistered}}User has full access{{/if}}"
}
```

3. **Configure RAG sources:**
```bash
PUT /api/agent-config/configurations/career/rag-sources
{
  "ragSourceIds": [
    { "id": "open-notebook-id", "priority": 1, "enabled": true },
    { "id": "custom-knowledge-base-id", "priority": 2, "enabled": true }
  ]
}
```

4. **Update output schema:**
```bash
PUT /api/agent-config/configurations/career
{
  "outputSchema": {
    "type": "object",
    "properties": {
      "message": { "type": "string" },
      "recommendations": { "type": "array", ... }
    }
  }
}
```

## Benefits

1. **No Code Changes**: Update prompts and schemas via API
2. **UI-Ready**: Structured output with rendering hints
3. **Multi-Source RAG**: Use multiple knowledge bases per agent
4. **Versioning**: Configurations are versioned automatically
5. **Testing**: Easy A/B testing of different prompts

