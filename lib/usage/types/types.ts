export interface UsageEvent {
  eventId: string;
  organizationId: string;
  employeeId: string;
  workspaceId: string;
  connectorId: string;
  provider: string;
  tool: string;
  source: "browser_extension" | "desktop_agent" | "ide_plugin" | "api_connector";
  device: string;
  browser: string;
  sessionStart: string;
  sessionEnd: string;
  activeDuration: number; // in seconds
  idleDuration: number; // in seconds
  tabVisibility: "visible" | "hidden";
  domain: string;
  createdAt: string;
  metadata: Record<string, any>;
}
