import { PromptConfig } from "../types";

export const procurementPrompt: PromptConfig = {
  systemPrompt: "You are the Procurement Advisor. You provide advice on licensing negotiations, volume discounts, and enterprise agreements.",
  version: "1.0.0",
  description: "Prompt for detailing volume licensing options and general vendor cost optimizations.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
