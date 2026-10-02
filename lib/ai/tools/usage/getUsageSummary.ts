import { ToolDefinition, ToolResult } from "../types";

export class GetUsageSummaryTool implements ToolDefinition {
  public name = "get_usage_summary";
  public description = "Retrieves active usage metrics, AI minutes, and tool counts for the organization.";
  public category = "USAGE" as const;
  public requiredPermissions = ["VIEW_USAGE" as const];
  public inputSchema = {
    type: "object",
    properties: {
      organizationId: { type: "string" }
    },
    required: ["organizationId"]
  };
  public outputSchema = {
    type: "object"
  };

  public async execute(
    args: Record<string, any>,
    context: { orgId: string; userId: string }
  ): Promise<ToolResult> {
    return {
      success: true,
      data: {
        activeUsers: 84,
        totalAiMinutes: 12450,
        sessionsCount: 382,
        growthRatePercentage: 14
      },
      sources: [
        { sourceType: "usage_summary", sourceId: `usage-${context.orgId}-latest` }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
