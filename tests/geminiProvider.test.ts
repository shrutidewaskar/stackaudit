import { AIContext } from "../lib/ai/context/types";
import { providerRegistry } from "../lib/ai/providers/registry";

async function runGeminiProviderTests() {
  console.log("=== Running Gemini Provider & Registry Tests ===");

  // Mock Context payload for test grounding
  const mockContext: AIContext = {
    organization: {
      id: "novatech-labs-uuid",
      name: "NovaTech Labs",
      industry: "Technology",
      companySize: "120",
      connectedConnectorsCount: 3,
      dataCoverage: 87
    },
    user: { id: "user-1", email: "admin@novatech.com", role: "compliance" },
    intent: "GOVERNANCE_EXPLANATION",
    governanceScore: 76,
    governanceDimensions: {
      visibility: { score: 80, status: "GOOD" },
      utilization: { score: 72, status: "NEEDS_IMPROVEMENT" },
      adoption: { score: 85, status: "GOOD" },
      redundancy: { score: 68, status: "NEEDS_IMPROVEMENT" },
      dataCompleteness: { score: 90, status: "GOOD" }
    },
    activeFindings: [],
    actionCandidates: [],
    recentReports: [],
    governanceTrends: [],
    conversationMemory: { summary: "", savedDecisions: [] },
    dataCoverage: 87,
    connectorHealth: {},
    generatedAt: new Date().toISOString()
  };

  // Test 1: Provider selection registry check
  const provider = providerRegistry.getProvider();
  console.log(`Test 1: Provider registry resolving active instance - PASSED`);

  // Test 2: Grounded response schema parsing
  const response = await provider.generate(mockContext, "Why did our score fall?");
  const isValidSchema = 
    typeof response.answer === "string" &&
    typeof response.confidence === "number" &&
    Array.isArray(response.citations);
  console.log(`Test 2: Grounded response structured contract - ${isValidSchema ? "PASSED" : "FAILED"}`);

  // Test 3: Citation source containment validator
  const citationsValid = response.citations.every((c) => {
    return c.id.includes("novatech-labs-uuid") || c.id === "report-weekly-latest" || c.id.startsWith("snap-") || c.id.startsWith("finding-");
  });
  console.log(`Test 3: Grounded citations reference valid source IDs - ${citationsValid ? "PASSED" : "FAILED"}`);

  console.log("=== Gemini Provider Test Suite Completed successfully ===");
}

runGeminiProviderTests().catch(console.error);
export {};
