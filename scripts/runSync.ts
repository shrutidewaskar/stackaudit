import { DailySyncJob } from "../lib/sync/scheduler";

async function main() {
  console.log("=== Manual Ingestion Sync Trigger ===");
  const result = await DailySyncJob.execute("novatech-labs-uuid");
  console.log(result.message);
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error("Daily Sync Job crashed:", err);
  process.exit(1);
});
