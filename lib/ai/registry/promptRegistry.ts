import { PromptConfig } from "../types";

export class PromptRegistry {
  private static instance: PromptRegistry;
  private prompts: Map<string, PromptConfig> = new Map();

  private constructor() {
    // Register standard prompt templates
    this.registerPrompt("executive_summary", {
      systemPrompt: "You are the Executive Writer. You summarize audit results into a high-level procurement summary for leadership.",
      version: "1.0.0",
      description: "Generates high-level executive summaries of stack audit results.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });

    this.registerPrompt("recommendation_explanation", {
      systemPrompt: "You are the Optimization Advisor. You formulate specific action items, downgrade steps, and rationales for duplicate subscriptions.",
      version: "1.0.0",
      description: "Explains optimizations and actions for tool subscriptions.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });

    this.registerPrompt("procurement_advisor", {
      systemPrompt: "You are the Procurement Advisor. You provide recommendations on enterprise agreements and negotiation tactics.",
      version: "1.0.0",
      description: "Supplies enterprise agreement and vendor negotiation guidance.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });

    this.registerPrompt("weekly_digest", {
      systemPrompt: "You are the StackAudit Reporter. You compile a weekly digest of SaaS/AI usage, changes, and cost updates for the team.",
      version: "1.0.0",
      description: "Generates weekly updates on license usage and spending trends.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });

    this.registerPrompt("monthly_report", {
      systemPrompt: "You are the Financial Analyst. You build a monthly ROI report showcasing total savings, optimization scores, and future actions.",
      version: "1.0.0",
      description: "Creates comprehensive monthly financial stack optimization reports.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });

    this.registerPrompt("conversation", {
      systemPrompt: "You are Ask StackAudit, a general support AI assistant inside the portal ready to answer user queries about tools and pricing.",
      version: "1.0.0",
      description: "Manages generic user chat sessions inside StackAudit.",
      supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
    });
  }

  public static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  public registerPrompt(key: string, config: PromptConfig) {
    this.prompts.set(key.toLowerCase(), config);
  }

  public getPrompt(key: string): PromptConfig {
    const prompt = this.prompts.get(key.toLowerCase());
    if (!prompt) {
      throw new Error(`Prompt configuration for "${key}" is not registered.`);
    }
    return prompt;
  }

  public listPrompts(): string[] {
    return Array.from(this.prompts.keys());
  }
}

export const promptRegistry = PromptRegistry.getInstance();
