import { PromptConfig } from "../types";

export const optimizationPrompt: PromptConfig = {
  systemPrompt: "You are the Optimization Advisor. You analyze product seats and suggest downgrades or plan adjustments.",
  version: "1.0.0",
  description: "Prompt for optimizing individual developer seats and feature packages.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
