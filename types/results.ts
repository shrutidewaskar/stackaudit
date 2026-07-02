export type OptimizationScoreLevel =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor";

export type OptimizationTone =
  | "excellent"
  | "good"
  | "fair"
  | "poor";

export type RecommendationSeverity = "High" | "Medium" | "Low";

export interface OptimizationScore {
  label: OptimizationScoreLevel;
  tone: OptimizationTone;
  description: string;
}

export interface Recommendation {
  tool: string;
  currentPlan: string;
  recommendedPlan: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  severity: RecommendationSeverity;
  monthlySpend?: number;
}

export interface AuditResult {
  totalCurrentMonthlySpend: number;
  totalOptimizedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  percentageSaved: number;
  optimizationScore: OptimizationScore;
  highestSavingTool: string;
  highestSavingAmount: number;
  recommendations: Recommendation[];
}