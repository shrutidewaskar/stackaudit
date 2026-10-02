import { toolRegistry } from "../lib/ai/tools/registry";
import { ToolGateway } from "../lib/ai/tools/gateway";
import "../lib/ai/tools"; // Load registrations

async function runTests() {
  console.log("=== Running AI Governed Tools Test Suite ===");

  const orgId = "novatech-labs-uuid";
  const userId = "user-123";
  const conversationId = "conv-123";

  // Test 1: Tool Registry lists registered tools
  const tools = toolRegistry.list();
  if (tools.length === 0) throw new Error("Registry is empty!");
  console.log(`Test 1: Tool Registry populated (${tools.length} tools) - PASSED`);

  // Test 2: Valid tool execution through gateway
  const scoreResult = await ToolGateway.execute(
    "get_governance_score",
    { organizationId: orgId },
    { orgId, userId, userRole: "admin", conversationId, callCount: 0 }
  );
  if (!scoreResult.success || scoreResult.data.overallScore !== 76) {
    throw new Error(`Valid execution failed: ${JSON.stringify(scoreResult)}`);
  }
  console.log("Test 2: Valid tool execution with data matches - PASSED");

  // Test 3: Organization isolation violation rejection
  const isolationResult = await ToolGateway.execute(
    "get_governance_score",
    { organizationId: "stolen-org-id" },
    { orgId, userId, userRole: "admin", conversationId, callCount: 0 }
  );
  if (isolationResult.success || !isolationResult.errors?.some(e => e.includes("Security Violation"))) {
    throw new Error(`Security isolation did not block request: ${JSON.stringify(isolationResult)}`);
  }
  console.log("Test 3: Cross-organization data boundary violation blocked - PASSED");

  // Test 4: Unknown tool resolution rejection
  const unknownResult = await ToolGateway.execute(
    "run_arbitrary_query",
    {},
    { orgId, userId, userRole: "admin", conversationId, callCount: 0 }
  );
  if (unknownResult.success) {
    throw new Error("Registry ran unregistered tool!");
  }
  console.log("Test 4: Unknown tool request rejected - PASSED");

  // Test 5: Role permission view/admin block
  const permissionResult = await ToolGateway.execute(
    "get_governance_score",
    { organizationId: orgId },
    { orgId, userId, userRole: "invalid-role", conversationId, callCount: 0 }
  );
  if (permissionResult.success) {
    throw new Error("Allowed tool execution for invalid user permissions!");
  }
  console.log("Test 5: Unauthorized role permission checked and blocked - PASSED");

  // Test 6: Bounded execution loop check
  const budgetResult = await ToolGateway.execute(
    "get_governance_score",
    { organizationId: orgId },
    { orgId, userId, userRole: "admin", conversationId, callCount: 5 } // Call count equal to limit
  );
  if (budgetResult.success || !budgetResult.errors?.some(e => e.includes("budget exhausted"))) {
    throw new Error(`Exceeded call limit check failed: ${JSON.stringify(budgetResult)}`);
  }
  console.log("Test 6: Bounded execution call loop limit enforced - PASSED");

  // Test 7: Audit log verification
  const logs = ToolGateway.getAuditLogs();
  if (logs.length === 0) {
    throw new Error("Audit logger recorded no events!");
  }
  const lastEvent = logs[logs.length - 1];
  if (lastEvent.errorCode !== "BUDGET_EXHAUSTED") {
    throw new Error(`Expected BUDGET_EXHAUSTED event code, got: ${lastEvent.errorCode}`);
  }
  console.log("Test 7: Metadata tool audit logging trace verified - PASSED");

  console.log("=== AI Governed Tools Test Suite Completed successfully ===");
}

runTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
