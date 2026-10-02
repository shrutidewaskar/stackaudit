export interface AIResponse {
  message: string;
  citations: string[];
  confidence: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata: Record<string, any>;
}

export interface AIStreamChunk {
  text: string;
  done: boolean;
  tokens?: number;
}

export interface AIProvider {
  generate(prompt: string, schema?: string, options?: any): Promise<AIResponse>;
  stream(prompt: string, options?: any): Promise<ReadableStream<AIStreamChunk>>;
  health(): Promise<boolean>;
  validateConfig(config: any): boolean;
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

