import { GovernanceReport, WeeklyDigestContent } from "./types";
import { GovernanceEngine } from "../engine";
import { ChangeDetectionService } from "./changeDetector";
import { localSnapshotsCache } from "./evaluationService";
import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export const localReportsCache: GovernanceReport[] = [];

export class DigestService {
  public static async generateWeeklyDigest(
    orgId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<GovernanceReport> {
    console.log(`[DigestService] Compiling Weekly Governance Digest for org: ${orgId}...`);

    // Fetch findings
    const findings = GovernanceEngine.generateFindings(orgId);

    // Mock comparison snapshots representing previous week
    const currScore = GovernanceEngine.calculateScore(orgId);
    const prevScore = {
      overallScore: 71,
      dimensions: {
        visibility: { score: 80 },
        utilization: { score: 65 },
        adoption: { score: 75 },
        redundancy: { score: 60 },
        dataCompleteness: { score: 85 }
      }
    };

    const delta = currScore.overallScore - prevScore.overallScore;

    const digestContent: WeeklyDigestContent = {
      scoreChange: delta,
      scoreBreakdownDeltas: {
        visibility: currScore.dimensions.visibility.score - prevScore.dimensions.visibility.score,
        utilization: currScore.dimensions.utilization.score - prevScore.dimensions.utilization.score,
        adoption: currScore.dimensions.adoption.score - prevScore.dimensions.adoption.score,
        redundancy: currScore.dimensions.redundancy.score - prevScore.dimensions.redundancy.score,
        dataCompleteness: currScore.dimensions.dataCompleteness.score - prevScore.dimensions.dataCompleteness.score
      },
      newFindings: findings.slice(0, 2),
      resolvedFindings: [],
      persistentHighFindings: findings.filter((f) => f.severity === "HIGH"),
      topDepartmentsByAdoption: [{ departmentId: "dept-eng", rate: 78 }],
      fastestGrowingTools: [{ tool: "cursor", growthPercent: 15 }],
      decliningTools: [],
      dormantLicensesCount: findings.filter((f) => f.type === "DORMANT_LICENSE").length,
      overlapsDetectedCount: findings.filter((f) => f.type === "CAPABILITY_OVERLAP").length,
      dataCoveragePercent: 87,
      connectorHealth: { okta: "Healthy", gworkspace: "Healthy" }
    };

    const report: GovernanceReport = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2),
      organizationId: orgId,
      reportType: "WEEKLY_DIGEST",
      periodStart,
      periodEnd,
      status: "NEW",
      content: digestContent as any,
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

    // Save report
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
