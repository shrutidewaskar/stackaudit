import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export class CursorConnector extends BaseConnector {
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
    return { licenses: 42, activeUsers: 39 };
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
      id: "cursor",
      name: "Cursor Business",
      provider: "cursor",
      description: "Sync Cursor Pro/Business active assignments, seat configurations, and workspace settings.",
      syncFrequency: "Daily",
      privacyCommitment: {
        collected: ["License Assignment", "Usage", "Projects"],
        neverCollected: ["Uploaded Files", "Prompts", "Responses", "Keystrokes", "Code Contents"]
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
