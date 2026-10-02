import { AIProvider, AIContext, AIResponse } from "./types";
import { ToolGateway } from "../tools/gateway";
import "../tools"; // Ensure tools register on load

export class MockAIProvider implements AIProvider {
  public async generate(context: AIContext, prompt: string): Promise<AIResponse> {
    console.log(`[MockAIProvider] Generating analyst response for intent: ${context.intent}`);

    // Bounded tool calling loop simulation through ToolGateway
    const toolContext = {
      orgId: context.organization.id,
      userId: context.user?.id || "user-1",
      userRole: context.user?.role || "admin",
      conversationId: "conv-mock-1",
      callCount: 0
    };

    // Execute tools through central Gateway to ensure policies / scopes execute fully
    const scoreResult = await ToolGateway.execute("get_governance_score", { organizationId: context.organization.id }, toolContext);
    const trendsResult = await ToolGateway.execute("get_governance_trends", { organizationId: context.organization.id }, { ...toolContext, callCount: 1 });
    const findingsResult = await ToolGateway.execute("get_governance_findings", { organizationId: context.organization.id }, { ...toolContext, callCount: 2 });

    let answer = "I have reviewed the StackAudit telemetry logs. ";
    
    if (context.intent === "GOVERNANCE_EXPLANATION") {
      answer += `The organization's overall Governance Score is currently ${context.governanceScore}/100. This score is calculated across 5 dimensions: Visibility (${context.governanceDimensions.visibility.score}), Utilization (${context.governanceDimensions.utilization.score}), Adoption (${context.governanceDimensions.adoption.score}), Redundancy (${context.governanceDimensions.redundancy.score}), and Data Completeness (${context.governanceDimensions.dataCompleteness.score}). The 8-point utilization drop was driven by one dormant Cursor license found in engineering.`;
    } else if (context.intent === "USAGE_ANALYSIS") {
      answer += "Total active AI usage is estimated at 15,400 minutes across 70 active users. Engineering remains the primary usage hub, accounting for 9,800 active minutes.";
    } else if (context.intent === "TOOL_ANALYSIS") {
      answer += `We detected capability overlaps between Claude and ChatGPT. Both share overlapping features in General AI, Research, and Coding. This results in redundancy metrics scoring at ${context.governanceDimensions.redundancy.score}.`;
    } else {
      answer += `Our data coverage is at ${context.dataCoverage}%, meaning we have high confidence in these audits. I recommend reviewing the 9 active action candidates.`;
    }

    return {
      answer,
      confidence: 0.98,
      citations: [
        {
          source: "governance_snapshot",
          id: `snap-${context.organization.id}-latest`,
          snippet: `Overall score: ${context.governanceScore}, coverage: ${context.dataCoverage}%`
        }
      ],
      relatedFindings: context.activeFindings.map((f) => f.id),
      relatedReports: ["report-weekly-latest"],
      recommendedActions: context.actionCandidates,
      followUpQuestions: [
        "Why did utilization score fall?",
        "Show me overlapping capabilities for ChatGPT and Claude."
      ]
    };
  }

  public async stream(
    context: AIContext,
    prompt: string,
    callback: (chunk: string) => void
  ): Promise<AIResponse> {
    const res = await this.generate(context, prompt);
    const chunks = res.answer.split(" ");
    
    for (const chunk of chunks) {
      callback(chunk + " ");
      // Introduce micro-delay to simulate stream
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return res;
  }

  public validateContext(context: AIContext): boolean {
    return context.organization.id !== "";
  }
}
