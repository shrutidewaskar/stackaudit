import { SyncManager } from "./syncManager";
import { MockUsageGenerator } from "../usage/storage/mockGenerator";

export class DailySyncJob {
  public static async execute(orgId = "novatech-labs-uuid"): Promise<{ success: boolean; message: string }> {
    console.log(`[DailySyncJob] Starting sync process for org: ${orgId}...`);
    
    // 1. Generate/collect mock events
    const events = MockUsageGenerator.generateEvents();

    try {
      // 2. Dispatch to SyncManager
      const manager = SyncManager.getInstance();
      const job = await manager.runBatchIngestion(orgId, events, "daily-scheduler-connector");

      console.log(`[DailySyncJob] Completed. Status: ${job.status}, Accepted: ${job.eventsAccepted}, Rejected: ${job.eventsRejected}`);
      return {
        success: true,
        message: `Sync completed with status: ${job.status}. Accepted: ${job.eventsAccepted}, Rejected: ${job.eventsRejected}.`
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Sync crashed";
      console.error(`[DailySyncJob] Sync failed: ${msg}`);
      return {
        success: false,
        message: `Sync failed: ${msg}`
      };
    }
  }
}
