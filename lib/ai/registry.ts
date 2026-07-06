import { AgentConfig } from "./types";
import { auditPrompt } from "./prompts/audit";
import { reportPrompt } from "./prompts/report";
import { procurementPrompt } from "./prompts/procurement";
import { optimizationPrompt } from "./prompts/optimization";
import { marketplacePrompt } from "./prompts/marketplace";
import { chatPrompt } from "./prompts/chat";
import { 
  buildAuditContext, 
  buildReportContext, 
  buildChatContext, 
  buildProcurementContext, 
  buildOptimizationContext 
} from "./context";

export const agentRegistry: Record<string, AgentConfig> = {
  "audit-analyst": {
    name: "Audit Analyst",
    description: "Analyzes AI tools and seat maps to detect direct stack redundancies.",
    prompt: auditPrompt,
    contextBuilder: buildAuditContext,
    schema: "AuditSummary",
    defaultModel: "mock-model-v1"
  },
  "optimization-advisor": {
    name: "Optimization Advisor",
    description: "Formulates specific optimization suggestions and downgrade steps.",
    prompt: optimizationPrompt,
    contextBuilder: buildOptimizationContext,
    schema: "OptimizationAdvice",
    defaultModel: "mock-model-v1"
  },
  "executive-writer": {
    name: "Executive Writer",
    description: "Summarizes optimization metrics into high-level reports for company executives.",
    prompt: reportPrompt,
    contextBuilder: buildReportContext,
    schema: "ExecutiveReport",
    defaultModel: "mock-model-v1"
  },
  "marketplace-expert": {
    name: "Marketplace Expert",
    description: "Compares marketplace tools, features, compliance policies, and capabilities.",
    prompt: marketplacePrompt,
    contextBuilder: buildProcurementContext,
    schema: "MarketplaceAnswer",
    defaultModel: "mock-model-v1"
  },
  "procurement-advisor": {
    name: "Procurement Advisor",
    description: "Provides recommendations on enterprise agreements and vendor negotiation tactics.",
    prompt: procurementPrompt,
    contextBuilder: buildProcurementContext,
    schema: "MarketplaceAnswer",
    defaultModel: "mock-model-v1"
  },
  "ask-stackaudit": {
    name: "Ask StackAudit",
    description: "General conversational support assistant for the StackAudit portal.",
    prompt: chatPrompt,
    contextBuilder: buildChatContext,
    schema: "ChatResponse",
    defaultModel: "mock-model-v1"
  }
};

export const getAgent = (id: string): AgentConfig | undefined => {
  return agentRegistry[id];
};
