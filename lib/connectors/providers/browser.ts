import { BaseConnector } from "../base/base";
import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export class BrowserExtensionConnector extends BaseConnector {
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
    return { events: 1420 };
  }

  async normalize(rawData: any): Promise<any> {
    return rawData;
  }

  getCapabilities(): ConnectorCapabilities {
    return {
      users: false,
      groups: false,
      licenses: false,
      organizationalUnits: false,
      usageEvents: true,
      billing: false,
      seatUsage: false,
      teams: false,
      repositories: false,
      members: false
    };
  }

  getMetadata(): ConnectorMetadata {
    return {
      id: "browser-extension",
      name: "StackAudit Browser Extension",
      provider: "browser",
      description: "Directly track web-based AI usage, active session durations, and idle times.",
      syncFrequency: "Realtime",
      privacyCommitment: {
        collected: ["Usage Events", "Session Duration", "Idle Time", "Active Time", "Visited Domain", "Tab Visibility"],
        neverCollected: ["Clipboard", "Uploaded Files", "Prompts", "Responses", "Keystrokes"]
      }
    };
  }

  supportsRealtime(): boolean {
    return true;
  }

  supportsIncrementalSync(): boolean {
    return false;
  }
}
