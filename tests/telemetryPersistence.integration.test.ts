import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { isSupabaseConfigured, assertSupabaseConfigured, supabase } from "../lib/supabase";
import { IngestionService } from "../lib/sync/ingestionService";
import { AggregationService } from "../lib/sync/aggregationService";
import { DeduplicationService } from "../lib/sync/deduplicationService";
import { SyncManager } from "../lib/sync/syncManager";
import { UsageEvent } from "../lib/usage/types/types";

/**
 * Phase 2B.1 Live Telemetry Persistence & Concurrency Verification Test
 * 
 * Runs strictly against live Supabase PostgreSQL when credentials exist.
 * If credentials are not configured or unreachable, reports BLOCKED.
 */
async function runLiveIntegrationTest() {
  console.log("===============================================================================");
  console.log("=== STACKAUDIT PHASE 2B.1: LIVE TELEMETRY PERSISTENCE VERIFICATION ===");
  console.log("===============================================================================");

  const configured = isSupabaseConfigured();
  if (!configured) {
    console.log("❌ LIVE DATABASE VERIFICATION BLOCKED: No valid Supabase credentials configured.");
    console.log("Status: BLOCKED — NO LIVE DATABASE");
    return;
  }

  // Force real production database mode (disable in-memory bypasses)
  process.env.DEV_MOCK_MODE = "false";
  process.env.ENABLE_DEV_MOCK_AUTH = "false";
  process.env.NODE_ENV = "production";

  // Test identifiers (unique prefix to allow clean isolation & tear down)
  const testPrefix = `test-${Date.now()}`;
  const orgA = "00000000-0000-0000-0000-000000000001";
  const orgB = "00000000-0000-0000-0000-000000000002";
  const eventId1 = `${testPrefix}-ev-1`;
  const eventId2 = `${testPrefix}-ev-2`;
  const eventIdConcurrent = `${testPrefix}-ev-concurrent`;
  const dateStr = new Date().toISOString().substring(0, 10);

  console.log(`[Config] Testing against live Supabase endpoint.`);
  console.log(`[Config] Test Prefix: ${testPrefix}`);

  try {
    // 0. Verify Database Connectivity & Schema Presence
    const { error: pingError } = await supabase.from("usage_events").select("id").limit(1);
    if (pingError) {
      if (pingError.message.includes("fetch failed") || pingError.message.includes("network")) {
        console.log(`❌ LIVE DATABASE VERIFICATION BLOCKED: Unable to connect to Supabase endpoint (${pingError.message})`);
        console.log("\nStatus: BLOCKED — NO LIVE DATABASE");
        return;
      }
      if (pingError.message.includes("Could not find the table") || pingError.message.includes("schema cache")) {
        console.log(`❌ LIVE DATABASE VERIFICATION BLOCKED: Connected to Supabase, but schema tables (usage_events, daily_usage, sync_jobs) have not yet been migrated to the remote database.`);
        console.log("   Required action: Apply database/schema.sql migrations to the Supabase project.");
        console.log("\nStatus: BLOCKED — NO LIVE DATABASE (SCHEMA PENDING MIGRATION)");
        return;
      }
    }

    // -------------------------------------------------------------------------
    // 1. LIVE USAGE_EVENTS INSERT & FRESH SERVICE READ
    // -------------------------------------------------------------------------
    console.log("\n1. Testing Live usage_events Durability (Insert -> Query -> Fresh Instance Query)...");
    const eventA: UsageEvent = {
      eventId: eventId1,
      organizationId: orgA,
      employeeId: `${testPrefix}-emp-1`,
      workspaceId: "ws-live",
      connectorId: "conn-live",
      provider: "openai",
      tool: "chatgpt",
      source: "browser_extension",
      device: "Windows",
      browser: "Chrome",
      sessionStart: `${dateStr}T10:00:00Z`,
      sessionEnd: `${dateStr}T10:30:00Z`,
      activeDuration: 1800,
      idleDuration: 0,
      tabVisibility: "visible",
      domain: "chatgpt.com",
      createdAt: new Date().toISOString(),
      metadata: { testSuite: "Phase 2B.1 Live" }
    };

    const ingestResult = await IngestionService.ingestBatch(orgA, [eventA]);
    console.log(`   Ingest result: accepted=${ingestResult.accepted}, duplicates=${ingestResult.duplicates}, errors=${ingestResult.errors.length}`);

    // Direct PostgreSQL query
    const { data: directEvent, error: directErr } = await supabase
      .from("usage_events")
      .select("*")
      .eq("event_id", eventId1)
      .maybeSingle();

    if (directErr || !directEvent) {
      throw new Error(`Direct SELECT failed: ${directErr?.message || "Event not found in DB"}`);
    }
    console.log(`   Direct PostgreSQL Query: Found event row ${directEvent.id} for event_id=${directEvent.event_id}`);

    // Fresh instance read via DeduplicationService (which queries DB in prod)
    const existsInFreshCheck = await DeduplicationService.isDuplicate(eventId1);
    console.log(`   Fresh Service Query: DeduplicationService detected persisted row = ${existsInFreshCheck}`);
    console.log(`   [Item 1 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 2. REAL IDEMPOTENCY TEST (Sequential Duplicate Submission)
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Real Idempotency (Sequential Resubmission)...");
    const resubmitResult = await IngestionService.ingestBatch(orgA, [eventA]);
    console.log(`   Resubmit result: accepted=${resubmitResult.accepted}, duplicates=${resubmitResult.duplicates}`);

    const { count: rowCount1 } = await supabase
      .from("usage_events")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId1);

    console.log(`   Database count for ${eventId1}: ${rowCount1} (Expected: 1)`);
    if (rowCount1 !== 1) {
      throw new Error(`Idempotency failure: Database contains ${rowCount1} rows for ${eventId1}`);
    }
    console.log(`   [Item 2 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 3. CONCURRENT IDEMPOTENCY TEST (Simultaneous Duplicate Insertions)
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Concurrent Idempotency (Database Constraint Race Protection)...");
    const concurrentEvent: UsageEvent = {
      ...eventA,
      eventId: eventIdConcurrent
    };

    // Execute multiple simultaneous batch ingestion attempts for the exact same event
    const concurrentRuns = await Promise.all([
      IngestionService.ingestBatch(orgA, [concurrentEvent]),
      IngestionService.ingestBatch(orgA, [concurrentEvent]),
      IngestionService.ingestBatch(orgA, [concurrentEvent])
    ]);

    const totalAccepted = concurrentRuns.reduce((sum, r) => sum + r.accepted, 0);
    const totalDuplicates = concurrentRuns.reduce((sum, r) => sum + r.duplicates, 0);
    console.log(`   Concurrent runs stats: Total Accepted=${totalAccepted}, Total Duplicates=${totalDuplicates}`);

    const { count: concurrentRowCount } = await supabase
      .from("usage_events")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventIdConcurrent);

    console.log(`   Database exact row count for ${eventIdConcurrent}: ${concurrentRowCount} (Expected: 1)`);
    if (concurrentRowCount !== 1) {
      throw new Error(`Concurrent uniqueness failure: Database contains ${concurrentRowCount} rows`);
    }
    console.log(`   [Item 3 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 4. REAL AGGREGATION DURABILITY
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Real Aggregation Durability (daily_usage & employee_usage_daily)...");
    await AggregationService.aggregateDaily(orgA, dateStr);

    // Verify daily_usage in PostgreSQL
    const { data: dailyRow, error: dailyErr } = await supabase
      .from("daily_usage")
      .select("*")
      .eq("organization_id", orgA)
      .eq("date", dateStr)
      .eq("provider", "openai")
      .eq("tool", "chatgpt")
      .maybeSingle();

    if (dailyErr || !dailyRow) {
      throw new Error(`daily_usage persistence failed: ${dailyErr?.message || "Record not found"}`);
    }
    console.log(`   daily_usage record persisted: activeMinutes=${dailyRow.active_minutes}, sessions=${dailyRow.sessions}`);

    // Verify employee_usage_daily in PostgreSQL
    const { data: empRow, error: empErr } = await supabase
      .from("employee_usage_daily")
      .select("*")
      .eq("organization_id", orgA)
      .eq("employee_id", `${testPrefix}-emp-1`)
      .eq("date", dateStr)
      .maybeSingle();

    if (empErr || !empRow) {
      throw new Error(`employee_usage_daily persistence failed: ${empErr?.message || "Record not found"}`);
    }
    console.log(`   employee_usage_daily record persisted: activeMinutes=${empRow.active_minutes}, sessions=${empRow.sessions}`);
    console.log(`   [Item 4 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 5. REAL SYNC_JOBS DURABILITY
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Real sync_jobs Durability...");
    const syncMgr = SyncManager.getInstance();
    const liveJob = await syncMgr.startSync(orgA, "test-connector");
    console.log(`   Started sync job: ${liveJob.id} status=${liveJob.status}`);

    await syncMgr.updateJobStatus(liveJob.id, "completed", {
      received: 10,
      accepted: 8,
      rejected: 2,
      duplicates: 0
    });

    // Fresh read from PostgreSQL
    const readBackJob = await syncMgr.getJob(liveJob.id);
    if (!readBackJob || readBackJob.status !== "completed" || readBackJob.eventsAccepted !== 8) {
      throw new Error(`sync_jobs verification failed. Retrieved: ${JSON.stringify(readBackJob)}`);
    }
    console.log(`   Retrieved persisted sync job from DB: status=${readBackJob.status}, eventsAccepted=${readBackJob.eventsAccepted}`);
    console.log(`   [Item 5 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 6. TENANT ISOLATION (Cross-tenant boundary check)
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Tenant Isolation on Telemetry Pipeline...");
    // Attempt to ingest Org B event using Org A boundary
    const crossOrgEvent: UsageEvent = {
      ...eventA,
      eventId: `${testPrefix}-cross-org`,
      organizationId: orgB
    };

    const crossResult = await IngestionService.ingestBatch(orgA, [crossOrgEvent]);
    const crossBoundaryBlocked = crossResult.rejected === 1 && crossResult.accepted === 0;
    console.log(`   Ingestion rejected mismatched tenant event: ${crossBoundaryBlocked ? "YES" : "NO"}`);

    if (!crossBoundaryBlocked) {
      throw new Error("Tenant boundary mismatch was not rejected");
    }
    console.log(`   [Item 6 Result]: LIVE DATABASE VERIFIED`);

    // -------------------------------------------------------------------------
    // 7. CLEANUP
    // -------------------------------------------------------------------------
    console.log("\n7. Cleaning up test artifacts...");
    await supabase.from("usage_events").delete().like("event_id", `${testPrefix}%`);
    await supabase.from("sync_jobs").delete().eq("id", liveJob.id);
    await supabase.from("daily_usage").delete().eq("organization_id", orgA).eq("date", dateStr);
    await supabase.from("employee_usage_daily").delete().eq("organization_id", orgA).like("employee_id", `${testPrefix}%`);
    console.log("   Cleanup completed.");

    console.log("\n===============================================================================");
    console.log("=== PHASE 2B.1 LIVE INTEGRATION TEST COMPLETED SUCCESSFULLY ===");
    console.log("===============================================================================");
  } catch (error) {
    console.error("❌ Live Integration Test Encountered an Error:", error);
    // Restore dev mode
    process.env.DEV_MOCK_MODE = "true";
    process.env.NODE_ENV = "test";
    throw error;
  } finally {
    // Always restore dev mode for unit runners
    process.env.DEV_MOCK_MODE = "true";
    process.env.NODE_ENV = "test";
  }
}

runLiveIntegrationTest().catch((err) => {
  console.error("Live integration run failed:", err);
  process.exit(1);
});
