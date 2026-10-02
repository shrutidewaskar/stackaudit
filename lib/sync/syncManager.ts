import { SyncJob, SyncStatus } from "./types";
import { IngestionService } from "./ingestionService";
import { AggregationService } from "./aggregationService";
import { UsageEvent } from "../usage/types/types";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export const mockSyncJobsDB: SyncJob[] = [];

export class SyncManager {
  private static instance: SyncManager;

  private constructor() {}

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public async startSync(orgId: string, connectorId: string | null): Promise<SyncJob> {
    const job: SyncJob = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2),
      organizationId: orgId,
      connectorId,
      status: "running",
      startedAt: new Date().toISOString(),
      completedAt: null,
      eventsReceived: 0,
      eventsAccepted: 0,
      eventsRejected: 0,
      eventsDeduplicated: 0,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isDevMockMode()) {
      mockSyncJobsDB.push(job);
    } else {
      assertSupabaseConfigured();
      const { error } = await supabase.from("sync_jobs").insert({
        id: job.id,
        organization_id: job.organizationId,
        connector_id: job.connectorId,
        status: job.status,
        started_at: job.startedAt
      });
      if (error) {
        throw new Error(`Database Error [sync_jobs.insert]: ${error.message}`);
      }
    }

    return job;
  }

  public async updateJobStatus(
    jobId: string,
    status: SyncStatus,
    stats: { received: number; accepted: number; rejected: number; duplicates: number },
    errorMsg: string | null = null
  ): Promise<void> {
    const completedAt = ["completed", "failed", "partial"].includes(status)
      ? new Date().toISOString()
      : null;

    if (isDevMockMode()) {
      const job = mockSyncJobsDB.find((j) => j.id === jobId);
      if (job) {
        job.status = status;
        job.eventsReceived = stats.received;
        job.eventsAccepted = stats.accepted;
        job.eventsRejected = stats.rejected;
        job.eventsDeduplicated = stats.duplicates;
        job.errorMessage = errorMsg;
        job.completedAt = completedAt;
        job.updatedAt = new Date().toISOString();
      }
      return;
    }

    assertSupabaseConfigured();
    const { error } = await supabase
      .from("sync_jobs")
      .update({
        status,
        completed_at: completedAt,
        events_received: stats.received,
        events_accepted: stats.accepted,
        events_rejected: stats.rejected,
        events_deduplicated: stats.duplicates,
        error_message: errorMsg,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);

    if (error) {
      throw new Error(`Database Error [sync_jobs.update]: ${error.message}`);
    }
  }

  public async getJob(jobId: string): Promise<SyncJob | null> {
    if (isDevMockMode()) {
      return mockSyncJobsDB.find((j) => j.id === jobId) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("sync_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [sync_jobs.getJob]: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      organizationId: data.organization_id,
      connectorId: data.connector_id,
      status: data.status,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      eventsReceived: data.events_received ?? 0,
      eventsAccepted: data.events_accepted ?? 0,
      eventsRejected: data.events_rejected ?? 0,
      eventsDeduplicated: data.events_deduplicated ?? 0,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async runBatchIngestion(
    orgId: string,
    events: UsageEvent[],
    connectorId: string | null = null
  ): Promise<SyncJob> {
    const job = await this.startSync(orgId, connectorId);

    try {
      const stats = await IngestionService.ingestBatch(orgId, events);
      
      // Calculate daily aggregations for the date range
      const uniqueDates = Array.from(
        new Set(events.map((e) => e.sessionStart.substring(0, 10)))
      );
      
      for (const dateStr of uniqueDates) {
        await AggregationService.aggregateDaily(orgId, dateStr);
      }

      await this.updateJobStatus(
        job.id,
        stats.rejected > 0 ? "partial" : "completed",
        {
          received: events.length,
          accepted: stats.accepted,
          rejected: stats.rejected,
          duplicates: stats.duplicates
        },
        stats.errors.length > 0 ? stats.errors.join("; ") : null
      );
    } catch (err) {
      await this.updateJobStatus(
        job.id,
        "failed",
        { received: events.length, accepted: 0, rejected: events.length, duplicates: 0 },
        err instanceof Error ? err.message : "Ingestion crash"
      );
      throw err;
    }

    const fetchedJob = await this.getJob(job.id);
    return fetchedJob || job;
  }
}

export const syncManager = SyncManager.getInstance();

