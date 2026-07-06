export interface AIResponse {
  text: string;
  raw?: any;
}

export interface AIStreamChunk {
  text: string;
  done: boolean;
}

export interface AIProvider {
  generate(prompt: string, schema?: string, options?: any): Promise<AIResponse>;
  stream(prompt: string, options?: any): Promise<ReadableStream<AIStreamChunk>>;
  health(): Promise<boolean>;
  name(): string;
}

export interface PromptConfig {
  systemPrompt: string;
  version: string;
  description: string;
  supportedModels: string[];
}

export interface AgentConfig {
  name: string;
  description: string;
  prompt: PromptConfig;
  contextBuilder: (input: any) => string;
  schema: string;
  defaultModel: string;
}
