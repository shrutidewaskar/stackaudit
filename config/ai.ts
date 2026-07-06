export interface AIConfig {
  provider: "mock" | "openai" | "anthropic" | "gemini";
  defaultModel: string;
  streaming: boolean;
  temperature: number;
  maxTokens: number;
}

export const aiConfig: AIConfig = {
  provider: "mock",
  defaultModel: "mock-model-v1",
  streaming: false,
  temperature: 0.2,
  maxTokens: 2048,
};
