import { NextRequest, NextResponse } from "next/server";
import { IngestionService } from "@/lib/sync/ingestionService";
import { SyncManager } from "@/lib/sync/syncManager";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, events } = body;

    if (!organizationId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid payload. Missing organizationId or events array." },
        { status: 400 }
      );
    }

    // Process batch through validation, privacy checks, normalizations, and deduplication
    const manager = SyncManager.getInstance();
    const job = await manager.runBatchIngestion(organizationId, events, "api-endpoint-connector");

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      accepted: job.eventsAccepted,
      rejected: job.eventsRejected,
      duplicates: job.eventsDeduplicated,
      errors: job.errorMessage ? job.errorMessage.split("; ") : []
    });
  } catch (error) {
    console.error("Usage Ingestion API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
