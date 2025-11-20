export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  isRegistered: boolean;
  conversationHistory?: AgentMessage[];
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  data?: Record<string, any>; // Structured data matching outputSchema
  metadata?: Record<string, any>;
  suggestions?: string[];
  nextActions?: string[];
}

export interface BaseAgent {
  name: string;
  description: string;
  processMessage(message: string, context: AgentContext): Promise<AgentResponse>;
}

export type AgentType = 'career' | 'training' | 'financial' | 'educational' | 'recruitment';

