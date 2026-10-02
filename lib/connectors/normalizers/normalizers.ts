export interface NormalizedOrganization {
  orgId: string;
  name: string;
  slug: string;
  industry: string | null;
  companySize: number | null;
}

export interface NormalizedDepartment {
  deptId: string;
  name: string;
  description: string | null;
}

export interface NormalizedEmployee {
  employeeId: string;
  name: string;
  email: string;
  jobTitle: string | null;
  status: "active" | "inactive" | "on_leave";
}

export interface NormalizedWorkspace {
  workspaceId: string;
  displayName: string | null;
  provider: string;
  status: "connected" | "disconnected" | "error";
}

export interface NormalizedLicense {
  licenseId: string;
  workspaceId: string;
  userId: string;
  toolName: string;
  planName: string;
  costMonthly: number;
  isActive: boolean;
}

export interface NormalizedUsageEvent {
  eventId: string;
  workspaceId: string;
  userId: string;
  toolName: string;
  activeDurationSecs: number;
  idleDurationSecs: number;
  timestamp: string;
  actionTaken: string;
}

export interface NormalizedSubscription {
  subId: string;
  toolName: string;
  planTier: string;
  seatCount: number;
  costMonthly: number;
  renewalDate: string;
}

export interface NormalizedConnector {
  id: string;
  name: string;
  provider: string;
  status: string;
}

export interface NormalizedConnectorStatus {
  id: string;
  health: string;
  lastSyncAt: string | null;
}
