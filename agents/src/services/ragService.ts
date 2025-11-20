import OpenAI from 'openai';

export interface RAGConfig {
  openNotebookUrl?: string;
  enabled: boolean;
  sources?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    apiKey?: string;
    priority: number;
  }>;
}

export interface RAGSearchResult {
  content: string;
  source?: string;
  score?: number;
}

export class RAGService {
  private openai: OpenAI;
  private config: RAGConfig;

  constructor(config: RAGConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Search configured RAG sources for relevant context
   */
  async search(query: string, limit: number = 5): Promise<RAGSearchResult[]> {
    if (!this.config.enabled) {
      return [];
    }

    // If sources are configured, use them
    if (this.config.sources && this.config.sources.length > 0) {
      const allResults: RAGSearchResult[] = [];
      
      // Search each source by priority
      const sortedSources = [...this.config.sources].sort((a, b) => a.priority - b.priority);
      
      for (const source of sortedSources) {
        try {
          const results = await this.searchSource(source, query, limit);
          allResults.push(...results);
        } catch (error) {
          console.warn(`RAG search failed for source ${source.name}:`, error);
        }
      }
      
      return allResults.slice(0, limit);
    }

    // Fallback to single Open Notebook URL
    if (this.config.openNotebookUrl) {
      return this.searchOpenNotebook(this.config.openNotebookUrl, query, limit);
    }

    return [];
  }

  private async searchOpenNotebook(url: string, query: string, limit: number): Promise<RAGSearchResult[]> {
    try {
      const response = await fetch(`${url}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
        }),
      });

      if (!response.ok) {
        console.warn('Open Notebook search failed:', response.statusText);
        return [];
      }

      const data = await response.json() as { results?: RAGSearchResult[] };
      return data.results || [];
    } catch (error) {
      console.error('RAG search error:', error);
      return [];
    }
  }

  private async searchSource(
    source: { type: string; url?: string; apiKey?: string },
    query: string,
    limit: number
  ): Promise<RAGSearchResult[]> {
    switch (source.type) {
      case 'open_notebook':
        if (source.url) {
          return this.searchOpenNotebook(source.url, query, limit);
        }
        break;
      
      case 'pinecone':
      case 'weaviate':
      case 'custom':
        // TODO: Implement other RAG source types
        console.warn(`RAG source type ${source.type} not yet implemented`);
        break;
    }
    
    return [];
  }

  /**
   * Get relevant context for a query using RAG
   */
  async getContext(query: string): Promise<string> {
    const results = await this.search(query, 5);
    
    if (results.length === 0) {
      return '';
    }

    return results
      .map((result, index) => `[Source ${index + 1}${result.source ? `: ${result.source}` : ''}]\n${result.content}`)
      .join('\n\n');
  }

  /**
   * Enhanced agent response using RAG context
   */
  async generateWithRAG(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    // Get relevant context from RAG
    const ragContext = await this.getContext(userMessage);
    
    // Enhance system prompt with RAG context
    let enhancedSystemPrompt = systemPrompt;
    if (ragContext) {
      enhancedSystemPrompt += `\n\nRelevant Context from Knowledge Base:\n${ragContext}\n\nUse this context to provide accurate and up-to-date information. If the context doesn't contain relevant information, use your general knowledge.`;
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: enhancedSystemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  }
}

