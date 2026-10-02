export interface BaseConnectorEvent {
  eventId: string;
  connectorId: string;
  provider: string;
  timestamp: string;
}

export interface ConnectorRegistered extends BaseConnectorEvent {
  registeredBy: string;
}

export interface ConnectorConnected extends BaseConnectorEvent {
  connectionStatus: "connected" | "failed";
}

export interface ConnectorDisconnected extends BaseConnectorEvent {
  reason?: string;
}

export interface ConnectorValidated extends BaseConnectorEvent {
  isValid: boolean;
  validationDetails?: string;
}

export interface SyncStarted extends BaseConnectorEvent {
  syncType: "incremental" | "full" | "realtime";
}

export interface SyncCompleted extends BaseConnectorEvent {
  recordsSynced: number;
}

export interface SyncFailed extends BaseConnectorEvent {
  errorMessage: string;
  errorCode?: string;
}

export interface NormalizationStarted extends BaseConnectorEvent {
  recordsCount: number;
}

export interface NormalizationCompleted extends BaseConnectorEvent {
  normalizedCount: number;
}

export interface AuthenticationExpired extends BaseConnectorEvent {
  expiredAt: string;
}
