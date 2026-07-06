import { PromptConfig } from "../types";

export const marketplacePrompt: PromptConfig = {
  systemPrompt: "You are the Marketplace Expert. You compare features, compliance profiles, and capabilities across various vendor models.",
  version: "1.0.0",
  description: "Prompt for answering user queries in the tools marketplace catalog.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
