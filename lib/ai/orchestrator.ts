import { aiConfig } from "@/config/ai";
import { MockProvider } from "./providers/mock";
import { getAgent } from "./registry";
import { validateAuditSummary } from "./schemas/audit";
import { validateExecutiveReport } from "./schemas/report";
import { validateChatResponse } from "./schemas/chat";
import { validateOptimizationAdvice } from "./schemas/optimization";
import { validateProcurementAdvice } from "./schemas/procurement";

export class AIOrchestrator {
  private getProvider() {
    // Sprint 0 defaults to MockProvider, in the future switch via aiConfig.provider
    return new MockProvider();
  }

  private validateResponse(schema: string, data: any): boolean {
    try {
      switch (schema) {
        case "AuditSummary":
          return validateAuditSummary(data);
        case "ExecutiveReport":
          return validateExecutiveReport(data);
        case "ChatResponse":
          return validateChatResponse(data);
        case "OptimizationAdvice":
          return validateOptimizationAdvice(data);
        case "MarketplaceAnswer":
          return validateProcurementAdvice(data);
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private getFallbackResponse(schema: string): any {
    switch (schema) {
      case "AuditSummary":
        return {
          summary: "Fallback summary: AI stack review completed. Redundancies detected in overlapping general chat seats.",
          score: 70,
          savingsMonthly: 0,
          savingsAnnual: 0
        };
      case "ExecutiveReport":
        return {
          title: "AI Stack Procurement Report (Fallback)",
          grade: "B",
          recommendationsCount: 0,
          topOpportunity: "Review overlapping chatbot seats"
        };
      case "OptimizationAdvice":
        return {
          recommendations: []
        };
      case "MarketplaceAnswer":
        return {
          answer: "Fallback: Comparative data is currently unavailable.",
          comparisons: []
        };
      case "ChatResponse":
        return {
          reply: "I'm sorry, I encountered an issue compiling the response. How else can I assist you?",
          suggestedFollowUps: []
        };
      default:
        return { message: "Fallback response content." };
    }
  }

  async runAgent(agentId: string, inputPayload: any): Promise<any> {
    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent with ID "${agentId}" not found in registry.`);
    }

    // 1. Build context
    const cleanContext = agent.contextBuilder(inputPayload);

    // 2. Build prompt
    const fullPrompt = `${agent.prompt.systemPrompt}\n\nContext:\n${cleanContext}\n\nPlease respond with a valid JSON structure matching the contract ${agent.schema}.`;

    // 3. Invoke provider
    const provider = this.getProvider();
    const response = await provider.generate(fullPrompt, agent.schema, {
      model: aiConfig.defaultModel,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens
    });

    // 4. Parse & Validate output
    try {
      const parsedData = JSON.parse(response.text);
      const isValid = this.validateResponse(agent.schema, parsedData);

      if (isValid) {
        return parsedData;
      } else {
        console.warn(`AI Orchestrator: Output validation failed for agent "${agentId}". Returning fallback.`);
        return this.getFallbackResponse(agent.schema);
      }
    } catch (err) {
      console.warn(`AI Orchestrator: Failed to parse provider response as JSON. Error: ${err}. Returning fallback.`);
      return this.getFallbackResponse(agent.schema);
    }
  }
}

export const orchestrator = new AIOrchestrator();
