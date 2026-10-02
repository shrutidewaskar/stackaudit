import { DailyGovernanceJob } from "./evaluationService";
import { DigestService } from "./digestService";
import { ReportService } from "./reportService";

export class GovernanceScheduler {
  public static async triggerDaily(orgId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await DailyGovernanceJob.execute(orgId);
      return {
        success: result.success,
        message: `Daily evaluation completed. Score: ${result.snapshot.overallScore}`
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Daily evaluation failed"
      };
    }
  }

  public static async triggerWeekly(orgId: string, start: string, end: string): Promise<{ success: boolean; message: string }> {
    try {
      const digest = await DigestService.generateWeeklyDigest(orgId, start, end);
      return {
        success: true,
        message: `Weekly Digest generated successfully. Report ID: ${digest.id}`
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Weekly Digest compilation failed"
      };
    }
  }

  public static async triggerMonthly(orgId: string, start: string, end: string): Promise<{ success: boolean; message: string }> {
    try {
      const report = await ReportService.generateMonthlyReport(orgId, start, end);
      return {
        success: true,
        message: `Monthly Executive Report compiled successfully. ID: ${report.id}`
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Monthly Executive Report failed"
      };
    }
  }

  public static async triggerQuarterly(orgId: string, start: string, end: string): Promise<{ success: boolean; message: string }> {
    try {
      const report = await ReportService.generateQuarterlyDataset(orgId, start, end);
      return {
        success: true,
        message: `Quarterly Review dataset compiled. ID: ${report.id}`
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Quarterly Review failed"
      };
    }
  }
}
