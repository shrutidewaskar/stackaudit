import { PromptConfig } from "../types";

export const reportPrompt: PromptConfig = {
  systemPrompt: "You are the Executive Writer. You summarize audit results into a high-level procurement summary for leadership.",
  version: "1.0.0",
  description: "Prompt for summarizing audit metrics into an executive-friendly text overview.",
  supportedModels: ["mock-model-v1", "claude-3-5-sonnet", "gpt-4o"]
};
