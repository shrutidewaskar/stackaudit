import { DailyGovernanceJob, localSnapshotsCache } from "../lib/governance/continuous/evaluationService";
import { DigestService, localReportsCache } from "../lib/governance/continuous/digestService";
import { ReportService } from "../lib/governance/continuous/reportService";
import { ChangeDetectionService } from "../lib/governance/continuous/changeDetector";
import { GovernanceEngine } from "../lib/governance/engine";

async function runContinuousTests() {
  console.log("=== Running Continuous Governance & Reporting Engine Tests ===");
  const orgId = "novatech-labs-uuid";

  // Test 1: Daily evaluation execution & snapshot creation
  localSnapshotsCache.length = 0;
  const evalResult = await DailyGovernanceJob.execute(orgId);
  console.log(`Test 1: DailyGovernanceJob executed - ${evalResult.success && localSnapshotsCache.length === 1 ? "PASSED" : "FAILED"}`);

  // Test 2: Duplicate snapshot prevention for same org + same date
  const evalDuplicate = await DailyGovernanceJob.execute(orgId);
  console.log(`Test 2: Duplicate snapshot avoided - ${localSnapshotsCache.length === 1 ? "PASSED" : "FAILED"}`);

  // Test 3: Score change detection calculations
  const snapAugust = evalResult.snapshot;
  const snapJuly = {
    ...snapAugust,
    id: "snap-july",
    snapshotDate: "2026-07-08",
    overallScore: 71,
    visibilityScore: 80,
    utilizationScore: 65,
    adoptionScore: 75,
    redundancyScore: 60,
    dataCompletenessScore: 85
  };

  const delta = ChangeDetectionService.compareSnapshots(snapAugust, snapJuly);
  const correctDelta = delta.overall === 5 && delta.utilization === 5;
  console.log(`Test 3: Score change detection computed deltas successfully - ${correctDelta ? "PASSED" : "FAILED"}`);

  // Test 4: Finding lifecycle (New finding vs Resolved finding detector)
  const findings = GovernanceEngine.generateFindings(orgId);
  const mockPrevFindings = findings.slice(0, 4); // simulate older run findings
  const lifecycleChanges = ChangeDetectionService.detectFindingChanges(findings, mockPrevFindings);
  const detectedCorrectly = lifecycleChanges.newFindings.length === 5 && lifecycleChanges.resolvedFindings.length === 0;
  console.log(`Test 4: Finding lifecycle change detector - ${detectedCorrectly ? "PASSED" : "FAILED"}`);

  // Test 5: Weekly Digest compilation
  localReportsCache.length = 0;
  const digest = await DigestService.generateWeeklyDigest(orgId, "2026-08-01", "2026-08-08");
  console.log(`Test 5: Weekly Digest compiled and cached - ${digest.reportType === "WEEKLY_DIGEST" && localReportsCache.length === 1 ? "PASSED" : "FAILED"}`);

  // Test 6: Monthly Executive Report compilation
  const monthly = await ReportService.generateMonthlyReport(orgId, "2026-08-01", "2026-08-08");
  console.log(`Test 6: Monthly Executive Report compiled - ${monthly.reportType === "MONTHLY_EXECUTIVE" ? "PASSED" : "FAILED"}`);

  // Test 7: Quarterly Governance Dataset compilation
  const quarterly = await ReportService.generateQuarterlyDataset(orgId, "2026-06-01", "2026-08-08");
  console.log(`Test 7: Quarterly Dataset compiled - ${quarterly.reportType === "QUARTERLY_REVIEW" ? "PASSED" : "FAILED"}`);

  console.log("=== Continuous Governance Test Suite Completed successfully ===");
}

runContinuousTests().catch(console.error);
export {};
