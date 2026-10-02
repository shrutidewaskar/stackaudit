import { GovernanceReport, ExecutiveReportContent } from "./types";
import { GovernanceEngine } from "../engine";
import { localReportsCache } from "./digestService";
import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export class ReportService {
  public static async generateMonthlyReport(
    orgId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<GovernanceReport> {
    console.log(`[ReportService] Generating Monthly Executive Report for org: ${orgId}...`);

    const score = GovernanceEngine.calculateScore(orgId);
    const findings = GovernanceEngine.generateFindings(orgId);

    const execContent: ExecutiveReportContent = {
      overallScore: score.overallScore,
      dimensionsScore: {
        visibility: score.dimensions.visibility.score,
        utilization: score.dimensions.utilization.score,
        adoption: score.dimensions.adoption.score,
        redundancy: score.dimensions.redundancy.score,
        dataCompleteness: score.dimensions.dataCompleteness.score
      },
      totalActiveMinutes: 15400,
      totalSessions: 1000,
      activeUsersCount: 70,
      aiToolsUsedCount: 3,
      departmentAnalysis: [
        { departmentId: "dept-eng", minutes: 9800, activeUsers: 45 },
        { departmentId: "dept-des", minutes: 3200, activeUsers: 15 },
        { departmentId: "dept-mkt", minutes: 2400, activeUsers: 10 }
      ],
      toolAnalysis: [
        { tool: "cursor", provider: "cursor", minutes: 7500, activeUsers: 40 },
        { tool: "chatgpt", provider: "openai", minutes: 4500, activeUsers: 25 },
        { tool: "claude", provider: "anthropic", minutes: 3400, activeUsers: 20 }
      ],
      dormantLicensesList: findings.filter((f) => f.type === "DORMANT_LICENSE"),
      overlapsList: findings.filter((f) => f.type === "CAPABILITY_OVERLAP"),
      findingsList: findings,
      dataCoveragePercent: 87,
      connectorHealth: { okta: "Healthy", gworkspace: "Healthy" },
      monthOverMonthChanges: { overallScore: 7, activeUsers: 10, totalActiveMinutes: 1200 },
      actionCandidates: findings.map((f) => ({ findingId: f.id, action: f.recommendedAction }))
    };

    const report: GovernanceReport = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2),
      organizationId: orgId,
      reportType: "MONTHLY_EXECUTIVE",
      periodStart,
      periodEnd,
      status: "NEW",
      content: execContent as any,
      metadata: {
        generationTimestamp: new Date().toISOString(),
        sourceSnapshotIds: [`snap-${orgId}-${periodEnd}`],
        sourcePeriod: { start: periodStart, end: periodEnd },
        governanceEngineVersion: "1.0.0",
        schemaVersion: "1.0.0"
      },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!isSupabaseConfigured) {
      localReportsCache.push(report);
    } else {
      try {
        const { error } = await supabase.from("governance_reports").insert({
          id: report.id,
          organization_id: report.organizationId,
          report_type: report.reportType,
          period_start: report.periodStart,
          period_end: report.periodEnd,
          status: report.status,
          content: report.content,
          metadata: report.metadata
        });
        if (error) throw error;
      } catch {
        localReportsCache.push(report);
      }
    }

    return report;
  }

  public static async generateQuarterlyDataset(
    orgId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<GovernanceReport> {
    console.log(`[ReportService] Generating Quarterly Governance Review Dataset for org: ${orgId}...`);

    const score = GovernanceEngine.calculateScore(orgId);
    const findings = GovernanceEngine.generateFindings(orgId);

    const quarterlyContent = {
      averageGovernanceScore: score.overallScore,
      scoreTrend: [71, 74, score.overallScore],
      totalActiveUsers: 85,
      adoptionGrowthPercent: 18,
      toolGrowthPercent: 12,
      departmentTrends: {
        engineering: "Growing",
        design: "Stable",
        marketing: "Lagging"
      },
      persistentFindingsCount: findings.length,
      resolvedFindingsCount: 3,
      recurringActionCandidates: ["REVIEW_LICENSE", "REVIEW_VENDOR_OVERLAP"],
      dataCoverageTrend: [82, 85, 87],
      connectorHealthTrend: { okta: "Healthy", gworkspace: "Healthy" }
    };

    const report: GovernanceReport = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2),
      organizationId: orgId,
      reportType: "QUARTERLY_REVIEW",
      periodStart,
      periodEnd,
      status: "NEW",
      content: quarterlyContent,
      metadata: {
        generationTimestamp: new Date().toISOString(),
        sourceSnapshotIds: [`snap-${orgId}-${periodEnd}`],
        sourcePeriod: { start: periodStart, end: periodEnd },
        governanceEngineVersion: "1.0.0",
        schemaVersion: "1.0.0"
      },
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (!isSupabaseConfigured) {
      localReportsCache.push(report);
    } else {
      try {
        const { error } = await supabase.from("governance_reports").insert({
          id: report.id,
          organization_id: report.organizationId,
          report_type: report.reportType,
          period_start: report.periodStart,
          period_end: report.periodEnd,
          status: report.status,
          content: report.content,
          metadata: report.metadata
        });
        if (error) throw error;
      } catch {
        localReportsCache.push(report);
      }
    }

    return report;
  }
}
