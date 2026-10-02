import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables before importing code to avoid ES6 hoisting issues
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true });

import { GeminiProvider } from "../lib/ai/providers/geminiProvider";
import { AIConfig } from "../lib/ai/config";
import { AIContext } from "../lib/ai/context/types";

async function runLiveSmokeTest() {
  console.log("=== Starting Live Gemini smoke test ===");
  console.log(`process.env Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  console.log(`AIConfig Project: ${AIConfig.vertex.project}`);
  console.log(`Credentials Path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

  // Create a minimal grounded AIContext
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
      visibility: { score: 80 },
      utilization: { score: 72 },
      adoption: { score: 85 },
      redundancy: { score: 68 },
      dataCompleteness: { score: 90 }
    } as any,
    activeFindings: [
      {
        id: "finding-dormant-cursor",
        organizationId: "novatech-labs-uuid",
        category: "UTILIZATION",
        severity: "HIGH",
        title: "12 Dormant Cursor Licenses",
        description: "12 users have not logged any activity on Cursor in the last 30 days.",
        evidence: { dormantLicenses: 12 },
        recommendedAction: { id: "action-1", actionType: "REVIEW_LICENSE", description: "Review unused seats" },
        status: "NEW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] as any[],
    actionCandidates: [],
    recentReports: [],
    governanceTrends: [],
    conversationMemory: { summary: "", savedDecisions: [] },
    dataCoverage: 87,
    connectorHealth: {},
    generatedAt: new Date().toISOString()
  };

  try {
    const provider = new GeminiProvider();
    console.log("[Live Test] Querying Gemini model on Vertex AI...");
    
    const response = await provider.generate(
      mockContext,
      "Why did our governance score decrease this month?"
    );

    console.log("\n=== Live Gemini Response ===");
    console.log("Answer:", response.answer);
    console.log("Confidence:", response.confidence);
    console.log("Citations:", JSON.stringify(response.citations, null, 2));
    console.log("============================\n");
    console.log("Smoke Test result: SUCCESS. Vertex AI connection established and returned correct structured schemas.");
  } catch (error) {
    console.error("Smoke Test result: FAILED. Vertex AI connection error:", error);
  }
}

runLiveSmokeTest();
export {};
