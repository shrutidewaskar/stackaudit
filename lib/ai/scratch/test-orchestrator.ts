import { orchestrator } from "../orchestrator";

async function main() {
  console.log("=== StackAudit AI Foundation Sprint 0 Verification ===");

  // Test Audit Analyst
  console.log("\n1. Testing Audit Analyst...");
  const auditResult = await orchestrator.runAgent("audit-analyst", {
    teamSize: 15,
    useCase: "Software development and data science",
    tools: [
      { name: "ChatGPT Plus", seats: 10, priceMonthly: 20 },
      { name: "Claude Team", seats: 12, priceMonthly: 30 }
    ]
  });
  console.log("Output:", auditResult);

  // Test Executive Writer
  console.log("\n2. Testing Executive Writer...");
  const reportResult = await orchestrator.runAgent("executive-writer", {
    totalSavingsMonthly: 1825,
    totalSavingsAnnual: 21900,
    optimizationScore: 85,
    recommendationsCount: 5
  });
  console.log("Output:", reportResult);

  // Test Ask StackAudit Chat
  console.log("\n3. Testing Ask StackAudit...");
  const chatResult = await orchestrator.runAgent("ask-stackaudit", {
    query: "How can I optimize my developer subscriptions?"
  });
  console.log("Output:", chatResult);

  console.log("\n=== Verification Successful ===");
}

main().catch(console.error);
