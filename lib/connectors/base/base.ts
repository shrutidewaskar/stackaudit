import { ConnectorHealth, ConnectorMetadata, ConnectorCapabilities } from "../types/types";

export abstract class BaseConnector {
  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<boolean>;
  abstract authenticate(): Promise<boolean>;
  abstract validateConfiguration(config: any): Promise<boolean>;
  abstract healthCheck(): Promise<ConnectorHealth>;
  abstract sync(): Promise<any>;
  abstract normalize(rawData: any): Promise<any>;
  abstract getCapabilities(): ConnectorCapabilities;
  abstract getMetadata(): ConnectorMetadata;
  abstract supportsRealtime(): boolean;
  abstract supportsIncrementalSync(): boolean;
}
