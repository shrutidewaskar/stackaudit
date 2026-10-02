import { AIProvider } from "../context/types";
import { MockAIProvider } from "../context/mockProvider";
import { GeminiProvider } from "./geminiProvider";
import { AIConfig } from "../config";

class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  constructor() {
    this.providers.set("mock", new MockAIProvider());
    try {
      this.providers.set("gemini", new GeminiProvider());
    } catch (e) {
      console.warn("[ProviderRegistry] Gemini initialization deferred/failed: ", e);
    }
  }

  public getProvider(): AIProvider {
    const providerKey = AIConfig.provider;
    const provider = this.providers.get(providerKey);
    
    if (!provider) {
      console.warn(`[ProviderRegistry] Provider ${providerKey} not found. Defaulting to mock.`);
      return this.providers.get("mock")!;
    }
    
    return provider;
  }
}

export const providerRegistry = new ProviderRegistry();
