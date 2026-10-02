import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export class JiraConnector extends BaseConnector {
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
    return { users: 115, projects: 8 };
  }

  async normalize(rawData: any): Promise<any> {
    return rawData;
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      users: true,
      groups: true,
      licenses: true,
      organizationalUnits: false,
      usageEvents: false,
      billing: false,
      seatUsage: false,
      teams: false,
      repositories: false,
      members: false
    };
  }

  getMetadata(): ConnectorMetadata {
    return {
      id: "jira",
      name: "Jira Software",
      provider: "jira",
      description: "Sync Atlassian access tokens, project seats, and member directories.",
      syncFrequency: "Daily",
      privacyCommitment: {
        collected: ["Users", "Groups", "Licenses"],
        neverCollected: ["Uploaded Files", "Keystrokes", "Clipboard", "Task Content"]
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
