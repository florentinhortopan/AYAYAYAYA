export interface AgentConfiguration {
  id: string;
  agentType: string;
  name: string;
  description: string;
  systemPromptTemplate: string;
  promptVariables: Record<string, any>;
  ragEnabled: boolean;
  ragSourceType: 'open_notebook' | 'custom' | 'none';
  ragSourceUrl?: string;
  ragSearchLimit: number;
  ragSources?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    priority: number;
    enabled: boolean;
  }>;
  outputSchema: any;
  uiConfig: any;
}

export class AgentConfigService {
  private configCache: Map<string, AgentConfiguration> = new Map();
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.API_URL || 'http://localhost:3001') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get agent configuration from API
   */
  async getConfig(agentType: string): Promise<AgentConfiguration | null> {
    // Check cache first
    if (this.configCache.has(agentType)) {
      return this.configCache.get(agentType)!;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/agent-config/configurations/${agentType}`);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const config = data.configuration;

      // Cache the configuration
      this.configCache.set(agentType, config);
      return config;
    } catch (error) {
      console.error(`Failed to load config for ${agentType}:`, error);
      return null;
    }
  }

  /**
   * Render prompt template with variables
   */
  renderPromptTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Simple template rendering (you can use a library like Handlebars for more features)
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
      
      // Support for if/else blocks (simple implementation)
      const ifRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{/if}}`, 'g');
      const ifElseRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{else}}([\\s\\S]*?){{/if}}`, 'g');
      
      rendered = rendered.replace(ifElseRegex, (match, truePart, falsePart) => {
        return value ? truePart : falsePart;
      });
      
      rendered = rendered.replace(ifRegex, (match, content) => {
        return value ? content : '';
      });
    });

    return rendered.trim();
  }

  /**
   * Clear configuration cache
   */
  clearCache(agentType?: string) {
    if (agentType) {
      this.configCache.delete(agentType);
    } else {
      this.configCache.clear();
    }
  }
}

