import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export class LinearConnector extends BaseConnector {
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
    return { users: 65, activeTeams: 4 };
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
      billing: false,
      seatUsage: false,
      teams: true,
      repositories: false,
      members: false
    };
  }

  getMetadata(): ConnectorMetadata {
    return {
      id: "linear",
      name: "Linear App",
      provider: "linear",
      description: "Sync Linear active seats, workspace directories, and team members.",
      syncFrequency: "Daily",
      privacyCommitment: {
        collected: ["Users", "Licenses", "Teams"],
        neverCollected: ["Uploaded Files", "Keystrokes", "Clipboard", "Issue Details"]
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
