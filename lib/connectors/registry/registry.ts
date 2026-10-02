import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";
import { GoogleWorkspaceConnector } from "../providers/google";
import { Microsoft365Connector } from "../providers/microsoft";
import { BrowserExtensionConnector } from "../providers/browser";
import { GitHubConnector } from "../providers/github";
import { SlackConnector } from "../providers/slack";
import { OpenAIConnector } from "../providers/openai";
import { AnthropicConnector } from "../providers/anthropic";
import { GeminiConnector } from "../providers/gemini";
import { CursorConnector } from "../providers/cursor";
import { PerplexityConnector } from "../providers/perplexity";
import { JiraConnector } from "../providers/jira";
import { LinearConnector } from "../providers/linear";

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private registry = new Map<string, BaseConnector>();

  private constructor() {
    // Automatically register all standard connector stubs
    this.registerProvider("google", new GoogleWorkspaceConnector());
    this.registerProvider("microsoft", new Microsoft365Connector());
    this.registerProvider("browser", new BrowserExtensionConnector());
    this.registerProvider("github", new GitHubConnector());
    this.registerProvider("slack", new SlackConnector());
    this.registerProvider("openai", new OpenAIConnector());
    this.registerProvider("anthropic", new AnthropicConnector());
    this.registerProvider("gemini", new GeminiConnector());
    this.registerProvider("cursor", new CursorConnector());
    this.registerProvider("perplexity", new PerplexityConnector());
    this.registerProvider("jira", new JiraConnector());
    this.registerProvider("linear", new LinearConnector());
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public registerProvider(providerName: string, connector: BaseConnector) {
    this.registry.set(providerName.toLowerCase(), connector);
  }

  public unregisterProvider(providerName: string): boolean {
    return this.registry.delete(providerName.toLowerCase());
  }

  public resolveProvider(providerName: string): BaseConnector {
    const connector = this.registry.get(providerName.toLowerCase());
    if (!connector) {
      throw new Error(`Connector for provider "${providerName}" is not registered.`);
    }
    return connector;
  }

  public listProviders(): string[] {
    return Array.from(this.registry.keys());
  }

  public providerCapabilities(providerName: string): ConnectorCapabilities {
    return this.resolveProvider(providerName).getCapabilities();
  }

  public async providerHealth(providerName: string): Promise<ConnectorHealth> {
    return await this.resolveProvider(providerName).healthCheck();
  }

  public providerMetadata(providerName: string): ConnectorMetadata {
    return this.resolveProvider(providerName).getMetadata();
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
