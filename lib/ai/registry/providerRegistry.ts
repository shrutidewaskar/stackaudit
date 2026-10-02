import { AIProvider } from "../types";
import { MockProvider } from "../providers/mock";
import { GeminiProvider } from "../providers/gemini";
import { AnthropicProvider } from "../providers/anthropic";
import { OpenAIProvider } from "../providers/openai";
import { aiConfig } from "@/config/ai";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, AIProvider> = new Map();

  private constructor() {
    this.registerProvider("mock", new MockProvider());
    this.registerProvider("gemini", new GeminiProvider());
    this.registerProvider("anthropic", new AnthropicProvider());
    this.registerProvider("openai", new OpenAIProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  public getProvider(name?: string): AIProvider {
    const targetName = (name || aiConfig.provider || "mock").toLowerCase();
    const provider = this.providers.get(targetName);
    if (!provider) {
      throw new Error(`AI Provider "${targetName}" is not registered.`);
    }
    return provider;
  }

  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
