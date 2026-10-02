import { AIContext, QueryIntent } from "./types";
import { GovernanceEngine } from "../../governance/engine";
import { AIContextPolicyFilters } from "./contextFilters";

export class AIContextBuilder {
  public static detectIntent(question: string): QueryIntent {
    const q = question.toLowerCase();
    
    if (q.includes("score") || q.includes("governance")) {
      return "GOVERNANCE_EXPLANATION";
    }
    if (q.includes("department") || q.includes("team")) {
      return "DEPARTMENT_ANALYSIS";
    }
    if (q.includes("tool") || q.includes("overlap") || q.includes("cursor") || q.includes("chatgpt")) {
      return "TOOL_ANALYSIS";
    }
    if (q.includes("procure") || q.includes("license") || q.includes("renew")) {
      return "PROCUREMENT_ANALYSIS";
    }
    if (q.includes("trend") || q.includes("month") || q.includes("history")) {
      return "TREND_ANALYSIS";
    }
    if (q.includes("report") || q.includes("executive")) {
      return "REPORT_SUMMARY";
    }
    if (q.includes("decision") || q.includes("replace")) {
      return "DECISION_SUPPORT";
    }
    if (q.includes("usage") || q.includes("active") || q.includes("minutes")) {
      return "USAGE_ANALYSIS";
    }
    
    return "GENERAL_STACKAUDIT";
  }

  public static async buildContext(
    orgId: string,
    userId: string,
    question: string
  ): Promise<AIContext> {
    const intent = this.detectIntent(question);
    
    // Evaluate scores and findings deterministically
    const scoreBreakdown = GovernanceEngine.calculateScore(orgId);
    const findings = GovernanceEngine.generateFindings(orgId);

    // Apply policy filters immediately to sanitise findings
    const sanitizedFindings = findings.map((f) => {
      const cleanEv = AIContextPolicyFilters.sanitize(f.evidence);
      return {
        ...f,
        evidence: cleanEv
      };
    });

    const context: AIContext = {
      organization: {
        id: orgId,
        name: "NovaTech Labs",
        industry: "Technology",
        companySize: "120 employees",
        connectedConnectorsCount: 3,
        dataCoverage: 87
      },
      user: {
        id: userId,
        email: "admin@novatech.com",
        role: "Compliance Officer"
      },
      intent,
      governanceScore: scoreBreakdown.overallScore,
      governanceDimensions: scoreBreakdown.dimensions,
      activeFindings: sanitizedFindings,
      actionCandidates: sanitizedFindings.map((f) => f.recommendedAction),
      recentReports: [
        {
          id: "report-weekly-latest",
          type: "WEEKLY_DIGEST",
          period: "2026-08-01 to 2026-08-08",
          summary: "Governance Score grew by +7 points. Active dormant license found."
        }
      ],
      governanceTrends: [
        { snapshotDate: "2026-07-08", overallScore: 71 },
        { snapshotDate: "2026-08-08", overallScore: scoreBreakdown.overallScore }
      ],
      conversationMemory: {
        summary: "Previously inquired about Cursor license distribution.",
        savedDecisions: ["Acknowledge Claude capability overlap"]
      },
      dataCoverage: 87,
      connectorHealth: { okta: "Healthy", gworkspace: "Healthy" },
      generatedAt: new Date().toISOString()
    };

    return context;
  }
}

// Stale types for backward compatibility with orchestrator.ts
export interface ContextInput {
  audit?: any;
  organization?: any;
  history?: any;
  recommendations?: any;
}

export class ContextBuilder {
  public static build(input: ContextInput): { formattedContextString: string } {
    return {
      formattedContextString: JSON.stringify(input)
    };
  }
}
