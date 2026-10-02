import { GovernanceFinding, GovernanceScoreBreakdown, ActionCandidate, GovernanceSnapshot } from "../../governance/types";
import { GovernanceReport } from "../../governance/continuous/types";

export type QueryIntent =
  | "GOVERNANCE_EXPLANATION"
  | "USAGE_ANALYSIS"
  | "DEPARTMENT_ANALYSIS"
  | "TOOL_ANALYSIS"
  | "PROCUREMENT_ANALYSIS"
  | "TREND_ANALYSIS"
  | "REPORT_SUMMARY"
  | "DECISION_SUPPORT"
  | "GENERAL_STACKAUDIT"
  | "UNKNOWN";

export interface AIContext {
  organization: {
    id: string;
    name: string;
    industry: string;
    companySize: string;
    connectedConnectorsCount: number;
    dataCoverage: number;
  };
  user: {
    id: string;
    email: string;
    role: string;
  };
  intent: QueryIntent;
  governanceScore: number;
  governanceDimensions: GovernanceScoreBreakdown["dimensions"];
  activeFindings: GovernanceFinding[];
  actionCandidates: ActionCandidate[];
  recentReports: { id: string; type: string; period: string; summary: string }[];
  governanceTrends: { snapshotDate: string; overallScore: number }[];
  conversationMemory: { summary: string; savedDecisions: string[] };
  dataCoverage: number;
  connectorHealth: Record<string, string>;
  generatedAt: string;
}

export interface AIResponse {
  answer: string;
  confidence: number;
  citations: { source: string; id: string; snippet: string }[];
  relatedFindings: string[];
  relatedReports: string[];
  recommendedActions: ActionCandidate[];
  followUpQuestions: string[];
}

export interface AIProvider {
  generate(context: AIContext, prompt: string): Promise<AIResponse>;
  stream(context: AIContext, prompt: string, callback: (chunk: string) => void): Promise<AIResponse>;
  validateContext(context: AIContext): boolean;
}
