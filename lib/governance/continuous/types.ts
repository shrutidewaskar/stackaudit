import { GovernanceFinding } from "../types";

export type ReportType =
  | "DAILY_SNAPSHOT"
  | "WEEKLY_DIGEST"
  | "MONTHLY_EXECUTIVE"
  | "QUARTERLY_REVIEW";

export interface ReportMetadata {
  generationTimestamp: string;
  sourceSnapshotIds: string[];
  sourcePeriod: { start: string; end: string };
  governanceEngineVersion: string;
  schemaVersion: string;
}

export interface GovernanceReport {
  id: string;
  organizationId: string;
  reportType: ReportType;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  status: "NEW" | "REVIEWING" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  content: Record<string, any>;
  metadata: ReportMetadata;
  generatedAt: string;
  createdAt: string;
}

export interface WeeklyDigestContent {
  scoreChange: number;
  scoreBreakdownDeltas: Record<string, number>;
  newFindings: GovernanceFinding[];
  resolvedFindings: GovernanceFinding[];
  persistentHighFindings: GovernanceFinding[];
  topDepartmentsByAdoption: { departmentId: string; rate: number }[];
  fastestGrowingTools: { tool: string; growthPercent: number }[];
  decliningTools: { tool: string; declinePercent: number }[];
  dormantLicensesCount: number;
  overlapsDetectedCount: number;
  dataCoveragePercent: number;
  connectorHealth: Record<string, string>;
}

export interface ExecutiveReportContent {
  overallScore: number;
  dimensionsScore: Record<string, number>;
  totalActiveMinutes: number;
  totalSessions: number;
  activeUsersCount: number;
  aiToolsUsedCount: number;
  departmentAnalysis: { departmentId: string; minutes: number; activeUsers: number }[];
  toolAnalysis: { tool: string; provider: string; minutes: number; activeUsers: number }[];
  dormantLicensesList: any[];
  overlapsList: any[];
  findingsList: GovernanceFinding[];
  dataCoveragePercent: number;
  connectorHealth: Record<string, string>;
  monthOverMonthChanges: Record<string, number>;
  actionCandidates: any[];
}
