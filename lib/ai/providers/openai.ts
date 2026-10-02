import { BaseAIProvider } from "./base";
import { AIResponse, AIStreamChunk } from "../types";

export class OpenAIProvider extends BaseAIProvider {
  name(): string {
    return "OpenAIProvider";
  }

  async health(): Promise<boolean> {
    return false;
  }

  validateConfig(config: any): boolean {
    return !!config && typeof config === "object";
  }

  async generate(prompt: string, schema?: string, options?: any): Promise<AIResponse> {
    throw new Error("Not Implemented");
  }

  async stream(prompt: string, options?: any): Promise<ReadableStream<AIStreamChunk>> {
    throw new Error("Not Implemented");
  }
}
