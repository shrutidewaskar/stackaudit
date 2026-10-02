export type FindingCategory =
  | "UTILIZATION"
  | "ADOPTION"
  | "REDUNDANCY"
  | "PROCUREMENT"
  | "GOVERNANCE"
  | "SECURITY"
  | "PLANNING";

export type FindingSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FindingStatus =
  | "NEW"
  | "REVIEWING"
  | "ACKNOWLEDGED"
  | "ACTION_PLANNED"
  | "RESOLVED"
  | "DISMISSED";

export type ActionCandidate =
  | "REVIEW_LICENSE"
  | "REVIEW_VENDOR_OVERLAP"
  | "INVESTIGATE_UNKNOWN_TOOL"
  | "CONNECT_DATA_SOURCE"
  | "REVIEW_DEPARTMENT_ADOPTION"
  | "MONITOR_USAGE_TREND";

export interface GovernanceFinding {
  id: string;
  organizationId: string;
  type: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence: Record<string, any>;
  affectedEmployees: string[];
  affectedDepartments: string[];
  affectedTools: string[];
  metrics: Record<string, any>;
  detectedAt: string;
  status: FindingStatus;
  recommendedAction: ActionCandidate;
  confidence: number;
}

export interface DimensionScore {
  score: number;
  rawMetrics: Record<string, any>;
  rulesUsed: string[];
  explanation: string;
}

export interface GovernanceScoreBreakdown {
  overallScore: number;
  dimensions: {
    visibility: DimensionScore;
    utilization: DimensionScore;
    adoption: DimensionScore;
    redundancy: DimensionScore;
    dataCompleteness: DimensionScore;
  };
}

export interface GovernanceSnapshot {
  id: string;
  organizationId: string;
  snapshotDate: string; // YYYY-MM-DD
  overallScore: number;
  visibilityScore: number;
  utilizationScore: number;
  adoptionScore: number;
  redundancyScore: number;
  dataCompletenessScore: number;
  findingCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  createdAt: string;
}
