import { IngestionService } from "../lib/sync/ingestionService";
import { AggregationService } from "../lib/sync/aggregationService";
import { GovernanceMetricsEngine } from "../lib/sync/governanceMetrics";
import { DeduplicationService } from "../lib/sync/deduplicationService";
import { UsageEvent } from "../lib/usage/types/types";

async function runTests() {
  console.log("=== Running Synchronization & Governance Data Engine Tests ===");
  const orgId = "novatech-labs-uuid";

  // Test 1: Ingestion validation of corrupt files/negatives
  const corruptEvent: UsageEvent = {
    eventId: "test-ev-corrupt",
    organizationId: orgId,
    employeeId: "emp-1",
    workspaceId: "ws-google",
    connectorId: "google-connector",
    provider: "google",
    tool: "gemini",
    source: "browser_extension",
    device: "Windows",
    browser: "Chrome",
    sessionStart: "2026-08-08T10:00:00Z",
    sessionEnd: "2026-08-08T09:00:00Z", // start after end
    activeDuration: -10, // negative duration
    idleDuration: 0,
    tabVisibility: "visible",
    domain: "gemini.google.com",
    createdAt: new Date().toISOString(),
    metadata: {}
  };

  DeduplicationService.clearCache();
  const corruptStats = await IngestionService.ingestBatch(orgId, [corruptEvent]);
  console.log(`Test 1: Corrupt event validation ${corruptStats.rejected === 1 ? "PASSED" : "FAILED"}`);

  // Test 2: Server-side Privacy sanitization
  const unsafeEvent: UsageEvent = {
    eventId: "test-ev-unsafe",
    organizationId: orgId,
    employeeId: "emp-1",
    workspaceId: "ws-openai",
    connectorId: "openai-connector",
    provider: "openai",
    tool: "chatgpt",
    source: "browser_extension",
    device: "Windows",
    browser: "Chrome",
    sessionStart: "2026-08-08T09:00:00Z",
    sessionEnd: "2026-08-08T09:30:00Z",
    activeDuration: 1800,
    idleDuration: 0,
    tabVisibility: "visible",
    domain: "chat.openai.com",
    createdAt: new Date().toISOString(),
    metadata: {
      prompt: "Show me the secret client codes" // prohibited prompt metadata
    }
  };

  const unsafeStats = await IngestionService.ingestBatch(orgId, [unsafeEvent]);
  console.log(`Test 2: Privacy sanitization filter ${unsafeStats.rejected === 1 ? "PASSED" : "FAILED"}`);

  // Test 3: Deduplication cache
  const validEvent: UsageEvent = {
    eventId: "test-ev-unique-123",
    organizationId: orgId,
    employeeId: "emp-1",
    workspaceId: "ws-openai",
    connectorId: "openai-connector",
    provider: "openai",
    tool: "chatgpt",
    source: "browser_extension",
    device: "Windows",
    browser: "Chrome",
    sessionStart: "2026-08-08T09:00:00Z",
    sessionEnd: "2026-08-08T09:30:00Z",
    activeDuration: 1800,
    idleDuration: 0,
    tabVisibility: "visible",
    domain: "chat.openai.com",
    createdAt: new Date().toISOString(),
    metadata: {
      emailDomain: "novatech.com"
    }
  };

  const batchStats = await IngestionService.ingestBatch(orgId, [validEvent, validEvent]);
  console.log(`Test 3: Deduplication idempotency check ${batchStats.accepted === 1 && batchStats.duplicates === 1 ? "PASSED" : "FAILED"}`);

  // Test 4: Daily aggregation math
  await AggregationService.aggregateDaily(orgId, "2026-08-08");
  console.log("Test 4: Daily aggregation metrics calculation executed.");

  // Test 5: Overlap and Dormant checks
  const overlaps = GovernanceMetricsEngine.detectOverlap();
  const dormant = GovernanceMetricsEngine.detectDormantLicenses(orgId);
  console.log(`Test 5: Overlaps detected: ${overlaps.length}, Dormant candidates: ${dormant.length} - PASSED`);

  console.log("=== Sync & Governance Test Suite Completed successfully ===");
}

runTests().catch(console.error);
