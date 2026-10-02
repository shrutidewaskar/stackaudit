import { ToolDefinition, ToolResult } from "../types";

export class GetWorkspacesTool implements ToolDefinition {
  public name = "get_workspaces";
  public description = "Retrieves active workspaces currently registered under the organization.";
  public category = "ORGANIZATION" as const;
  public requiredPermissions = ["VIEW_ORGANIZATION" as const];
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
    const workspaces = [
      { id: "ws-1", name: "NovaTech Engineering Main", connector: "GitHub" },
      { id: "ws-2", name: "NovaTech Marketing Hub", connector: "Slack" }
    ];

    return {
      success: true,
      data: { workspaces },
      sources: workspaces.map((w) => ({ sourceType: "workspace", sourceId: w.id })),
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
