import { UsageEvent } from "../types/types";

export interface UsageCollector {
  start(): Promise<boolean>;
  stop(): Promise<boolean>;
  collect(event: any): Promise<UsageEvent>;
  validate(event: UsageEvent): Promise<boolean>;
  normalize(rawData: any): Promise<UsageEvent>;
  flush(): Promise<boolean>;
}

export class BrowserCollector implements UsageCollector {
  private active = false;

  async start(): Promise<boolean> {
    this.active = true;
    return true;
  }

  async stop(): Promise<boolean> {
    this.active = false;
    return true;
  }

  async collect(event: any): Promise<UsageEvent> {
    if (!this.active) {
      throw new Error("Collector is not active.");
    }
    return this.normalize(event);
  }

  async validate(event: UsageEvent): Promise<boolean> {
    if (!event.organizationId || !event.employeeId) return false;
    if (event.activeDuration < 0 || event.idleDuration < 0) return false;
    return true;
  }

  async normalize(rawData: any): Promise<UsageEvent> {
    return {
      eventId: rawData.eventId || Math.random().toString(36).substring(2),
      organizationId: rawData.organizationId || "novatech-labs-uuid",
      employeeId: rawData.employeeId || "emp-1",
      workspaceId: rawData.workspaceId || "ws-browser",
      connectorId: rawData.connectorId || "browser-extension",
      provider: rawData.provider || "openai",
      tool: rawData.tool || "chatgpt",
      source: "browser_extension",
      device: rawData.device || "Windows",
      browser: rawData.browser || "Chrome",
      sessionStart: rawData.sessionStart || new Date().toISOString(),
      sessionEnd: rawData.sessionEnd || new Date().toISOString(),
      activeDuration: rawData.activeDuration || 0,
      idleDuration: rawData.idleDuration || 0,
      tabVisibility: rawData.tabVisibility || "visible",
      domain: rawData.domain || "chat.openai.com",
      createdAt: new Date().toISOString(),
      metadata: rawData.metadata || {}
    };
  }

  async flush(): Promise<boolean> {
    return true;
  }
}
