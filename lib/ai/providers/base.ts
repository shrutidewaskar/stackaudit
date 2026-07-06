import { AIProvider, AIResponse, AIStreamChunk } from "../types";

export abstract class BaseAIProvider implements AIProvider {
  abstract generate(prompt: string, schema?: string, options?: any): Promise<AIResponse>;
  
  abstract stream(prompt: string, options?: any): Promise<ReadableStream<AIStreamChunk>>;
  
  abstract health(): Promise<boolean>;
  
  abstract name(): string;
}
