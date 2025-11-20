import { BaseAgent, AgentMessage, AgentContext, AgentResponse } from '../types/agent';
import OpenAI from 'openai';
import { RAGService } from '../services/ragService';
import { AgentConfigService, AgentConfiguration } from '../services/agentConfigService';

export abstract class ConfigurableAgentImpl implements BaseAgent {
  abstract agentType: 'career' | 'training' | 'financial' | 'educational' | 'recruitment';
  abstract name: string;
  abstract description: string;
  
  protected openai: OpenAI | null = null;
  protected configService: AgentConfigService;
  protected config: AgentConfiguration | null = null;
  protected ragService: RAGService | null = null;

  constructor(apiBaseUrl?: string) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
    
    this.configService = new AgentConfigService(apiBaseUrl);
  }

  /**
   * Load configuration from API
   */
  async loadConfiguration(): Promise<void> {
    if (!this.config) {
      this.config = await this.configService.getConfig(this.agentType) || null;
      
      if (this.config && this.config.ragEnabled) {
        // Initialize RAG service with configured sources
        this.ragService = new RAGService({
          enabled: this.config.ragEnabled,
          openNotebookUrl: this.config.ragSourceUrl,
          sources: this.config.ragSources?.map(source => ({
            id: source.id,
            name: source.name,
            type: source.type,
            url: source.url,
            priority: source.priority
          }))
        });
      }
    }
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Load configuration if not loaded
      await this.loadConfiguration();

      // If OpenAI client is not initialized, return helpful message
      if (!this.openai) {
        return {
          message: `I'm ${this.name}. To use my full capabilities, please configure an OpenAI API key in your environment variables.`,
          metadata: {
            apiKeyMissing: true,
            agentName: this.name,
            agentType: this.agentType
          }
        };
      }

      // Use configuration if available, otherwise use defaults
      const systemPrompt = this.config 
        ? this.configService.renderPromptTemplate(
            this.config.systemPromptTemplate,
            { ...this.config.promptVariables, ...this.getContextVariables(context) }
          )
        : this.getDefaultSystemPrompt(context);

      let responseMessage: string;
      let structuredData: Record<string, any> = {};
      let metadata: Record<string, any> = {
        agentType: this.agentType,
        ragEnabled: false,
        timestamp: new Date()
      };

      // Use RAG if configured and available
      if (this.ragService && this.config?.ragEnabled) {
        const history = this.buildConversationHistory(context.conversationHistory || []);
        const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = history.map(msg => ({
          role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }));
        
        responseMessage = await this.generateWithRAG(
          systemPrompt,
          message,
          conversationHistory
        );
        metadata.ragEnabled = true;
        if (this.config?.ragSources) {
          metadata.ragSources = this.config.ragSources.map(s => s.name);
        }
      } else {
        // Standard completion
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...this.buildConversationHistory(context.conversationHistory || []),
          { role: 'user', content: message }
        ];

        const completion = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          ...(this.config?.outputSchema && {
            response_format: { type: 'json_object' }
          })
        });

        responseMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
        
        // Parse structured output if available
        if (this.config?.outputSchema) {
          try {
            structuredData = JSON.parse(responseMessage);
            // Extract message from structured data if it exists
            if (structuredData.message) {
              responseMessage = structuredData.message;
            }
          } catch (e) {
            // If parsing fails, treat as plain text
          }
        }

        metadata.model = completion.model;
        metadata.usage = completion.usage;
      }

      return {
        message: responseMessage,
        data: structuredData,
        metadata
      };
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        data: {},
        metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          agentType: this.agentType
        }
      };
    }
  }

  protected abstract getDefaultSystemPrompt(context: AgentContext): string;

  protected getContextVariables(context: AgentContext): Record<string, any> {
    return {
      isRegistered: context.isRegistered || false,
      userId: context.userId || '',
      sessionId: context.sessionId || ''
    };
  }

  protected async generateWithRAG(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    if (!this.ragService) {
      throw new Error('RAG service not initialized');
    }

    const ragContext = await this.ragService.getContext(userMessage);
    
    let enhancedSystemPrompt = systemPrompt;
    if (ragContext) {
      enhancedSystemPrompt += `\n\nRelevant Context from Knowledge Base:\n${ragContext}\n\nUse this context to provide accurate and up-to-date information.`;
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const completion = await this.openai!.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  }

  protected buildConversationHistory(history: AgentMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }));
  }

  protected getContextualInfo(context: AgentContext): string {
    let info = '';
    if (context.isRegistered) {
      info += 'The user has a registered account and has access to full features.\n';
    } else {
      info += 'The user is a guest and has limited access. Encourage registration for full features.\n';
    }
    return info;
  }
}

