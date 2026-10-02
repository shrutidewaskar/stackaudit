import { AIContextBuilder } from "../lib/ai/context/contextBuilder";
import { AIContextPolicyFilters } from "../lib/ai/context/contextFilters";
import { AIContextValidator } from "../lib/ai/context/contextValidator";
import { MockAIProvider } from "../lib/ai/context/mockProvider";

async function runContextTests() {
  console.log("=== Running AI Context & Grounding Layer Tests ===");
  const orgId = "novatech-labs-uuid";

  // Test 1: Intent detection
  const intent1 = AIContextBuilder.detectIntent("Why did our governance score decrease?");
  const intent2 = AIContextBuilder.detectIntent("Show me department usage stats.");
  console.log(`Test 1: Intent detection classification (Score: ${intent1}, Dept: ${intent2}) - ${intent1 === "GOVERNANCE_EXPLANATION" && intent2 === "DEPARTMENT_ANALYSIS" ? "PASSED" : "FAILED"}`);

  // Test 2: Privacy filtering sanitization
  const sensitiveObj = {
    password: "super-secret-pw",
    activeSeconds: 300,
    prompt: "Show me client data codes"
  };
  const cleanObj = AIContextPolicyFilters.sanitize(sensitiveObj);
  const privacyPassed = 
    cleanObj.password === "[REDACTED_PRIVACY_COMPLIANCE]" &&
    cleanObj.prompt === "[REDACTED_PRIVACY_COMPLIANCE]" &&
    cleanObj.activeSeconds === 300;
  console.log(`Test 2: Privacy filters sanitization - ${privacyPassed ? "PASSED" : "FAILED"}`);

  // Test 3: Organization boundary isolation & Validator checks
  const context = await AIContextBuilder.buildContext(orgId, "user-123", "Why did our score decrease?");
  const isValid = AIContextValidator.validate(orgId, context);
  const invalidOrgIdCheck = AIContextValidator.validate("other-org-id", context);
  console.log(`Test 3: Organization boundary isolation validation - ${isValid && !invalidOrgIdCheck ? "PASSED" : "FAILED"}`);

  // Test 4: Token Budget limit validator check
  const massiveData = "A".repeat(600 * 1024); // 600KB
  const oversizedContext = {
    ...context,
    massiveData
  };
  const sizeBudgetCheck = AIContextValidator.validate(orgId, oversizedContext as any);
  console.log(`Test 4: Token budget limit check (Oversized rejected) - ${!sizeBudgetCheck ? "PASSED" : "FAILED"}`);

  // Test 5: Mock AI Provider simulation
  const provider = new MockAIProvider();
  const response = await provider.generate(context, "Explain score");
  const responseMatches = response.answer.includes("overall Governance Score is currently");
  console.log(`Test 5: Mock AI Grounded response simulation - ${responseMatches ? "PASSED" : "FAILED"}`);

  console.log("=== AI Context Test Suite Completed successfully ===");
}

runContextTests().catch(console.error);
export {};
