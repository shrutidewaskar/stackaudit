import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export class PerplexityConnector extends BaseConnector {
  async connect(): Promise<boolean> {
    throw new Error("Not Implemented");
  }

  async disconnect(): Promise<boolean> {
    throw new Error("Not Implemented");
  }

  async authenticate(): Promise<boolean> {
    throw new Error("Not Implemented");
  }

  async validateConfiguration(config: any): Promise<boolean> {
    return true;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    return ConnectorHealth.Connected;
  }

  async sync(): Promise<any> {
    return { seats: 15, costMonthly: 300 };
  }

  async normalize(rawData: any): Promise<any> {
    return rawData;
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      users: true,
      groups: false,
      licenses: true,
      organizationalUnits: false,
      usageEvents: false,
      billing: true,
      seatUsage: true,
      teams: false,
      repositories: false,
      members: false
    };
  }

  getMetadata(): ConnectorMetadata {
    return {
      id: "perplexity",
      name: "Perplexity Pro",
      provider: "perplexity",
      description: "Sync Perplexity Pro seats, billing receipts, and team member directories.",
      syncFrequency: "Daily",
      privacyCommitment: {
        collected: ["Seat Usage", "Billing", "Workspace"],
        neverCollected: ["Prompts", "Responses", "Keystrokes", "Clipboard", "Uploaded Files"]
      }
    };
  }

  supportsRealtime(): boolean {
    return false;
  }

  supportsIncrementalSync(): boolean {
    return true;
  }
}
