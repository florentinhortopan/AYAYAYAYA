import { BaseAgent, AgentMessage, AgentContext, AgentResponse } from '../types/agent';
import OpenAI from 'openai';
import { RAGService } from '../services/ragService';

export abstract class BaseAgentImpl implements BaseAgent {
  abstract name: string;
  abstract description: string;
  
  protected openai: OpenAI | null = null;
  protected systemPrompt: string;
  protected ragService: RAGService | null = null;

  constructor(systemPrompt: string) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
    this.systemPrompt = systemPrompt;
    
    // Initialize RAG service if Open Notebook is configured
    const openNotebookUrl = process.env.OPEN_NOTEBOOK_URL;
    if (openNotebookUrl) {
      this.ragService = new RAGService({
        openNotebookUrl,
        enabled: process.env.RAG_ENABLED !== 'false',
      });
    }
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // If OpenAI client is not initialized (no API key), return a helpful message
      if (!this.openai) {
        return {
          message: `I'm ${this.name}. To use my full capabilities, please configure an OpenAI API key in your environment variables. For now, I can provide basic information. Please add your OPENAI_API_KEY to the .env file to enable AI-powered responses.`,
          metadata: {
            apiKeyMissing: true,
            agentName: this.name
          }
        };
      }

      // Use RAG if available, otherwise use standard completion
      let responseMessage: string;
      let metadata: Record<string, any> = {};

      if (this.ragService) {
        // Use RAG-enhanced generation
        const history = this.buildConversationHistory(context.conversationHistory || []);
        const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = history.map(msg => ({
          role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }));
        responseMessage = await this.ragService.generateWithRAG(
          this.getSystemPrompt(context),
          message,
          conversationHistory
        );
        metadata.ragEnabled = true;
      } else {
        // Standard completion
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: this.getSystemPrompt(context) },
          ...this.buildConversationHistory(context.conversationHistory || []),
          { role: 'user', content: message }
        ];

        const completion = await this.openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        });

        responseMessage = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
        metadata.model = completion.model;
        metadata.usage = completion.usage;
        metadata.ragEnabled = false;
      }

      return {
        message: responseMessage,
        metadata
      };
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  protected abstract getSystemPrompt(context: AgentContext): string;

  protected buildConversationHistory(history: AgentMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
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

