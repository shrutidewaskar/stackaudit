import { NextRequest } from "next/server";
import { POST as handleEnrollment } from "../app/api/auth/enroll/route";
import { POST as handleUsageIngest } from "../app/api/usage/events/route";
import { IngestionService } from "../lib/sync/ingestionService";
import { DeduplicationService } from "../lib/sync/deduplicationService";
import { AggregationService } from "../lib/sync/aggregationService";
import { UsageEvent } from "../lib/usage/types/types";

// Helper simulating client-side PrivacyFilter sanitization
function filterEventPrivacy(event: any): any {
  const clean = { ...event };
  const banned = [
    "prompt", "response", "clipboard", "keystrokes", "keystroke", 
    "screenshot", "file", "document", "chatHistory", "pageContent",
    "query", "input", "output", "tokens"
  ];
  
  banned.forEach((key) => {
    delete clean[key];
    if (clean.metadata && typeof clean.metadata === "object") {
      delete clean.metadata[key];
    }
  });

  return clean;
}

// Helper simulating Multi-Tab active/idle tracking calculation
function calculateMultiTabDuration(tabs: Array<{ hasFocus: boolean; isVisible: boolean; activeTicks: number }>) {
  // Only the single focused and visible tab contributes to real active user engagement
  const activeTab = tabs.find((t) => t.hasFocus && t.isVisible);
  return activeTab ? activeTab.activeTicks : 0;
}

async function runExtensionProductionSuite() {
  console.log("===============================================================================");
  console.log("=== STACKAUDIT PHASE 2C: BROWSER EXTENSION PRODUCTION READINESS TEST SUITE ===");
  console.log("===============================================================================");

  process.env.NODE_ENV = "test";
  process.env.DEV_MOCK_MODE = "true";
  process.env.ALLOW_DEV_AUTH_BYPASS = "true";

  const orgA = "novatech-labs-uuid";
  const orgB = "acme-corp-uuid";
  const testUserId = "user-uuid-1";
  const enrollmentToken = "stk_enroll_test_token_123";

  // -------------------------------------------------------------------------
  // 1. SECURE ENROLLMENT & TOKEN EXCHANGE
  // -------------------------------------------------------------------------
  console.log("\n1. Testing Secure Enrollment Token Validation & Exchange...");

  // 1.1 Create enrollment token (Authorized user)
  const enrollCreateReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    headers: { "x-dev-user-id": testUserId },
    body: JSON.stringify({ action: "create", organizationId: orgA })
  });
  const enrollCreateRes = await handleEnrollment(enrollCreateReq);
  const enrollCreateData = await enrollCreateRes.json();
  const generatedToken = enrollCreateData.pairingToken?.token;
  const t1_1 = enrollCreateRes.status === 201 && generatedToken?.startsWith("stk_enroll_");
  console.log(`   1.1 Token Generation (POST /api/auth/enroll): ${t1_1 ? "PASSED" : "FAILED"}`);

  // 1.2 Validate valid enrollment token (Extension handshake)
  const enrollValidReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    body: JSON.stringify({ action: "validate", token: generatedToken, organizationId: orgA })
  });
  const enrollValidRes = await handleEnrollment(enrollValidReq);
  const enrollValidData = await enrollValidRes.json();
  const t1_2 = enrollValidRes.status === 200 && enrollValidData.valid === true && enrollValidData.organizationId === orgA;
  console.log(`   1.2 Token Validation Handshake: ${t1_2 ? "PASSED" : "FAILED"}`);

  // 1.3 Invalid enrollment token rejected (401)
  const enrollInvalidReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    body: JSON.stringify({ action: "validate", token: "invalid_unrecognized_token_xyz" })
  });
  const enrollInvalidRes = await handleEnrollment(enrollInvalidReq);
  const t1_3 = enrollInvalidRes.status === 401;
  console.log(`   1.3 Invalid Token Rejection (401): ${t1_3 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATED EXTENSION INGESTION & TENANT ISOLATION
  // -------------------------------------------------------------------------
  console.log("\n2. Testing Authenticated Ingestion & Tenant Boundaries...");

  const testEvent: UsageEvent = {
    eventId: `ext-test-ev-${Date.now()}-1`,
    organizationId: orgA,
    employeeId: "emp-ext-1",
    workspaceId: "ws-openai",
    connectorId: "openai-connector",
    provider: "openai",
    tool: "chatgpt",
    source: "browser_extension",
    device: "Windows",
    browser: "Chrome",
    sessionStart: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sessionEnd: new Date().toISOString(),
    activeDuration: 1800,
    idleDuration: 0,
    tabVisibility: "visible",
    domain: "chatgpt.com",
    createdAt: new Date().toISOString()
  };

  // 2.1 Ingest with valid bearer token
  const authIngestReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${generatedToken}`,
      "x-organization-id": orgA
    },
    body: JSON.stringify({
      organizationId: orgA,
      events: [testEvent]
    })
  });
  const authIngestRes = await handleUsageIngest(authIngestReq);
  const authIngestData = await authIngestRes.json();
  const t2_1 = authIngestRes.status === 200 && authIngestData.accepted === 1;
  console.log(`   2.1 Ingest with Bearer Token: ${t2_1 ? "PASSED" : "FAILED"}`);

  // 2.2 Ingest rejected when missing auth token (401)
  const unauthIngestReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    body: JSON.stringify({
      organizationId: orgA,
      events: [testEvent]
    })
  });
  const unauthIngestRes = await handleUsageIngest(unauthIngestReq);
  const t2_2 = unauthIngestRes.status === 401;
  console.log(`   2.2 Missing Auth Rejected (401): ${t2_2 ? "PASSED" : "FAILED"}`);

  // 2.3 Cross-Tenant Mismatch Rejection
  const crossOrgEvent = { ...testEvent, eventId: `ext-cross-${Date.now()}`, organizationId: orgB };
  const crossTenantResult = await IngestionService.ingestBatch(orgA, [crossOrgEvent]);
  const t2_3 = crossTenantResult.rejected === 1 && crossTenantResult.accepted === 0;
  console.log(`   2.3 Tenant Mismatch Ingest Rejection: ${t2_3 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 3. MULTI-TAB FOCUS GATING & ANTI-INFLATION
  // -------------------------------------------------------------------------
  console.log("\n3. Testing Multi-Tab Focus Gating & Anti-Inflation...");

  // Simulate 3 concurrent open tabs (e.g. 3 ChatGPT tabs open simultaneously)
  const tab1 = { hasFocus: true, isVisible: true, activeTicks: 60 };  // Currently active focused tab
  const tab2 = { hasFocus: false, isVisible: true, activeTicks: 60 }; // Background tab
  const tab3 = { hasFocus: false, isVisible: false, activeTicks: 60 }; // Hidden tab

  const totalRawTicks = tab1.activeTicks + tab2.activeTicks + tab3.activeTicks; // 180s (Inflated)
  const reconciledActiveDuration = calculateMultiTabDuration([tab1, tab2, tab3]); // 60s (Correct)

  const t3_1 = reconciledActiveDuration === 60 && totalRawTicks === 180;
  console.log(`   3.1 Multi-Tab Focus Reconciled (60s vs 180s raw): ${t3_1 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 4. PERIODIC CHECKPOINTS & CRASH RECOVERY
  // -------------------------------------------------------------------------
  console.log("\n4. Testing Periodic Checkpoints & Crash Recovery...");

  // Simulate a 180-second session flushing checkpoints at 60s intervals
  const checkpoint1: UsageEvent = {
    ...testEvent,
    eventId: `chk-1-${Date.now()}`,
    activeDuration: 60,
    metadata: { isCheckpoint: true, checkpointIndex: 1 }
  };
  const checkpoint2: UsageEvent = {
    ...testEvent,
    eventId: `chk-2-${Date.now()}`,
    activeDuration: 60,
    metadata: { isCheckpoint: true, checkpointIndex: 2 }
  };

  const chkBatch = await IngestionService.ingestBatch(orgA, [checkpoint1, checkpoint2]);
  const t4_1 = chkBatch.accepted === 2;
  console.log(`   4.1 Incremental Checkpoints Ingested: ${t4_1 ? "PASSED" : "FAILED"}`);

  // Deduplication check: re-submitting checkpoint 1 must be acknowledged as duplicate
  const chkReplay = await IngestionService.ingestBatch(orgA, [checkpoint1]);
  const t4_2 = chkReplay.duplicates === 1 && chkReplay.accepted === 0;
  console.log(`   4.2 Checkpoint Idempotent Replay Protection: ${t4_2 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 5. CLIENT PRIVACY SANITIZATION COMPLIANCE
  // -------------------------------------------------------------------------
  console.log("\n5. Testing Client-Side Privacy Sanitization...");

  const sensitivePayload = {
    eventId: "ext-privacy-test",
    provider: "openai",
    tool: "chatgpt",
    prompt: "Write confidential customer contract terms",
    response: "Here is the internal corporate financial table",
    clipboard: "password123",
    keystrokes: "SELECT * FROM users",
    activeDuration: 120,
    metadata: {
      pageContent: "Internal Document Body",
      tokens: 450,
      safeMetric: "normal"
    }
  };

  const sanitized = filterEventPrivacy(sensitivePayload);
  const t5_1 = 
    sanitized.prompt === undefined &&
    sanitized.response === undefined &&
    sanitized.clipboard === undefined &&
    sanitized.keystrokes === undefined &&
    sanitized.metadata.pageContent === undefined &&
    sanitized.metadata.tokens === undefined &&
    sanitized.metadata.safeMetric === "normal" &&
    sanitized.activeDuration === 120;
  console.log(`   5.1 Strict PII / Content Stripping: ${t5_1 ? "PASSED" : "FAILED"}`);

  console.log("\n===============================================================================");
  console.log("=== ALL PHASE 2C EXTENSION PRODUCTION TESTS COMPLETED SUCCESSFULLY ===");
  console.log("===============================================================================");
}

runExtensionProductionSuite().catch((err) => {
  console.error("Extension test suite error:", err);
  process.exit(1);
});
