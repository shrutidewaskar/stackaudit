import { DailyGovernanceJob } from "../lib/governance/continuous/evaluationService";

async function main() {
  console.log("=== Triggering Daily Governance Evaluation Pipeline ===");
  const result = await DailyGovernanceJob.execute("novatech-labs-uuid");
  console.log(`Pipeline completed. Score: ${result.snapshot.overallScore}, Findings count: ${result.snapshot.findingCount}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Daily Governance Evaluation Job failed:", err);
  process.exit(1);
});
export {};
