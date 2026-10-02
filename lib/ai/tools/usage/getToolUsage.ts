import { ToolDefinition, ToolResult } from "../types";

export class GetToolUsageTool implements ToolDefinition {
  public name = "get_tool_usage";
  public description = "Retrieves active users, usage minutes, and provider details for tools detected in the organization.";
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
    type: "array"
  };

  public async execute(
    args: Record<string, any>,
    context: { orgId: string; userId: string }
  ): Promise<ToolResult> {
    const tools = [
      { tool: "Cursor", provider: "Anysphere", activeUsers: 48, aiMinutes: 9800, adoption: 85 },
      { tool: "Copilot", provider: "GitHub", activeUsers: 36, aiMinutes: 2650, adoption: 72 }
    ];

    return {
      success: true,
      data: { tools },
      sources: [
        { sourceType: "tool_telemetry", sourceId: `tool-telemetry-${context.orgId}` }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
