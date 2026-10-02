import { providerRegistry } from "./registry/providerRegistry";
import { promptRegistry } from "./registry/promptRegistry";
import { AIResponse } from "./types";
import { ContextBuilder, ContextInput } from "./context/contextBuilder";
import { validateAuditSummary } from "./schemas/audit";
import { validateExecutiveReport } from "./schemas/report";
import { validateChatResponse } from "./schemas/chat";
import { validateOptimizationAdvice } from "./schemas/optimization";
import { validateProcurementAdvice } from "./schemas/procurement";

export class AIOrchestrator {
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

  async runAgent(agentId: string, inputPayload: any): Promise<AIResponse> {
    // 1. Resolve prompt key based on agent ID
    let promptKey = "conversation";
    let schema = "ChatResponse";

    if (agentId === "audit-analyst") {
      promptKey = "executive_summary";
      schema = "AuditSummary";
    } else if (agentId === "optimization-advisor") {
      promptKey = "recommendation_explanation";
      schema = "OptimizationAdvice";
    } else if (agentId === "executive-writer") {
      promptKey = "monthly_report";
      schema = "ExecutiveReport";
    } else if (agentId === "marketplace-expert" || agentId === "procurement-advisor") {
      promptKey = "procurement_advisor";
      schema = "MarketplaceAnswer";
    }

    const promptConfig = promptRegistry.getPrompt(promptKey);

    // 2. Build structured context using ContextBuilder
    const contextInput: ContextInput = {
      audit: inputPayload.audit || (inputPayload.tools ? inputPayload : undefined),
      organization: inputPayload.organization || (inputPayload.teamSize ? { teamSize: inputPayload.teamSize, useCase: inputPayload.useCase } : undefined),
      history: inputPayload.history,
      recommendations: inputPayload.recommendations
    };
    
    const contextPayload = ContextBuilder.build(contextInput);

    // 3. Assemble full prompt
    const fullPrompt = `${promptConfig.systemPrompt}\n\nContext:\n${contextPayload.formattedContextString}\n\nPlease respond with a valid JSON structure matching the contract ${schema}.`;

    // 4. Invoke selected provider dynamically
    const provider = providerRegistry.getProvider();
    const response = await provider.generate(fullPrompt, schema);

    // 5. Parse & Validate output
    try {
      const parsedData = JSON.parse(response.message);
      const isValid = this.validateResponse(schema, parsedData);

      if (isValid) {
        return response;
      } else {
        console.warn(`AI Orchestrator: Output validation failed for agent "${agentId}". Returning fallback.`);
        const fallbackMsg = JSON.stringify(this.getFallbackResponse(schema));
        return {
          ...response,
          message: fallbackMsg,
          confidence: 0.5,
          metadata: { ...response.metadata, validationFailed: true, fallback: true }
        };
      }
    } catch (err) {
      console.warn(`AI Orchestrator: Failed to parse provider response as JSON. Error: ${err}. Returning fallback.`);
      const fallbackMsg = JSON.stringify(this.getFallbackResponse(schema));
      return {
        ...response,
        message: fallbackMsg,
        confidence: 0.5,
        metadata: { ...response.metadata, parseError: true, fallback: true }
      };
    }
  }
}

export const orchestrator = new AIOrchestrator();
