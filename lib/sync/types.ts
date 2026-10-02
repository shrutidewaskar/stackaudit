export type SyncStatus = "queued" | "running" | "completed" | "partial" | "failed" | "retrying";

export interface SyncJob {
  id: string;
  organizationId: string;
  connectorId: string | null;
  status: SyncStatus;
  startedAt: string | null;
  completedAt: string | null;
  eventsReceived: number;
  eventsAccepted: number;
  eventsRejected: number;
  eventsDeduplicated: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyUsage {
  id: string;
  organizationId: string;
  date: string; // YYYY-MM-DD
  provider: string;
  tool: string;
  departmentId: string | null;
  activeUsers: number;
  sessions: number;
  activeMinutes: number;
  idleMinutes: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeUsageDaily {
  id: string;
  organizationId: string;
  employeeId: string;
  departmentId: string | null;
  date: string; // YYYY-MM-DD
  provider: string;
  tool: string;
  sessions: number;
  activeMinutes: number;
  idleMinutes: number;
  lastActivityAt: string | null;
  createdAt: string;
}

export interface IngestionResult {
  accepted: number;
  rejected: number;
  duplicates: number;
  errors: string[];
}

export interface ToolCapabilityMap {
  tool: string;
  provider: string;
  capabilities: string[];
}
