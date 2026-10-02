import { ToolDefinition, ToolResult } from "../types";
import { GovernanceEngine } from "../../../governance/engine";

export class GetGovernanceScoreTool implements ToolDefinition {
  public name = "get_governance_score";
  public description = "Retrieves the current governance score and the 5 dimension scores for an organization.";
  public category = "GOVERNANCE" as const;
  public requiredPermissions = ["VIEW_GOVERNANCE" as const];
  public inputSchema = {
    type: "object",
    properties: {
      organizationId: { type: "string" }
    },
    required: ["organizationId"]
  };
  public outputSchema = {
    type: "object",
    properties: {
      overallScore: { type: "number" },
      dimensions: { type: "object" }
    }
  };

  public async execute(
    args: Record<string, any>,
    context: { orgId: string; userId: string }
  ): Promise<ToolResult> {
    const scores = GovernanceEngine.calculateScore(context.orgId);

    return {
      success: true,
      data: {
        overallScore: scores.overallScore,
        dimensions: scores.dimensions
      },
      sources: [
        { sourceType: "governance_snapshot", sourceId: `snap-${context.orgId}-latest` }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
