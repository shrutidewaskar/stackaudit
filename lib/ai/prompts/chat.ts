import { PromptConfig } from "../types";

export const chatPrompt: PromptConfig = {
  systemPrompt: "You are the Ask StackAudit conversational assistant. You help answer general questions about the platform, savings opportunities, and features.",
  version: "1.0.0",
  description: "Prompt configuration for conversational support and chatbot assistance.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
