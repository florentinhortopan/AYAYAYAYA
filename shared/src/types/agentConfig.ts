export interface AgentConfiguration {
  id: string;
  agentType: 'career' | 'training' | 'financial' | 'educational' | 'recruitment';
  name: string;
  description: string;
  systemPromptTemplate: string;
  promptVariables: Record<string, any>;
  ragEnabled: boolean;
  ragSourceType: 'open_notebook' | 'custom' | 'none';
  ragSourceUrl?: string;
  ragSearchLimit: number;
  outputSchema: JSONSchema;
  uiConfig: UIConfig;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RAGSource {
  id: string;
  name: string;
  type: 'open_notebook' | 'pinecone' | 'weaviate' | 'custom';
  url?: string;
  apiKey?: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRAGSourceMapping {
  id: string;
  agentConfigId: string;
  ragSourceId: string;
  priority: number;
  enabled: boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: any[];
  items?: JSONSchema;
  properties?: Record<string, JSONSchemaProperty>;
}

export interface UIConfig {
  layout: 'recommendations' | 'programs' | 'benefits' | 'default';
  fields: UIField[];
}

export interface UIField {
  name: string;
  type: 'text' | 'list' | 'object' | 'number' | 'boolean';
  label?: string;
  component?: string; // React component name for custom rendering
  fields?: UIField[]; // Nested fields for objects
}

export interface AgentResponse {
  message: string;
  data: Record<string, any>; // Structured data matching outputSchema
  metadata: {
    agentType: string;
    ragEnabled: boolean;
    ragSources?: string[];
    timestamp: Date;
  };
}

