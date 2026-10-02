export enum ConnectorHealth {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
  Healthy = "Healthy",
  Warning = "Warning",
  Syncing = "Syncing",
  AuthenticationExpired = "AuthenticationExpired",
  ConfigurationRequired = "ConfigurationRequired",
  Error = "Error"
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoUrl?: string;
  syncFrequency: string;
  privacyCommitment: {
    collected: string[];
    neverCollected: string[];
  };
}

export interface ConnectorCapabilities {
  users: boolean;
  groups: boolean;
  licenses: boolean;
  organizationalUnits: boolean;
  usageEvents: boolean;
  billing: boolean;
  seatUsage: boolean;
  teams: boolean;
  repositories: boolean;
  members: boolean;
}
