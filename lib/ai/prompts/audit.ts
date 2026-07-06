import { PromptConfig } from "../types";

export const auditPrompt: PromptConfig = {
  systemPrompt: "You are the StackAudit Analyst. You analyze a team's software licenses and identify redundancies.",
  version: "1.0.0",
  description: "Prompt for analyzing general AI stack cost health and optimization scores.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
