import { AgentType, AgentContext, AgentResponse, BaseAgent } from '../types/agent';
import { CareerAdvisorAgent } from '../agents/careerAdvisorAgent';
import { TrainingCoachAgent } from '../agents/trainingCoachAgent';
import { FinancialAssistantAgent } from '../agents/financialAssistantAgent';
import { EducationalBot } from '../agents/educationalBot';
import { RecruitmentAgent } from '../agents/recruitmentAgent';

export class AgentOrchestrator {
  private agents: Map<AgentType, BaseAgent>;

  constructor() {
    this.agents = new Map<AgentType, BaseAgent>([
      ['career', new CareerAdvisorAgent()],
      ['training', new TrainingCoachAgent()],
      ['financial', new FinancialAssistantAgent()],
      ['educational', new EducationalBot()],
      ['recruitment', new RecruitmentAgent()],
    ]);
  }

  async routeToAgent(
    agentType: AgentType,
    message: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentType);
    
    if (!agent) {
      throw new Error(`Agent type ${agentType} not found`);
    }

    return await agent.processMessage(message, context);
  }

  getAvailableAgents(): Array<{ type: AgentType; name: string; description: string }> {
    return Array.from(this.agents.entries()).map(([type, agent]) => ({
      type,
      name: agent.name,
      description: agent.description,
    }));
  }
}

