import { ToolDefinition, ToolResult } from "../types";

export class GetDepartmentUsageTool implements ToolDefinition {
  public name = "get_department_usage";
  public description = "Retrieves active usage levels, minutes, and scores broken down by department.";
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
    const departments = [
      { name: "Engineering", activeUsers: 45, aiMinutes: 8400, adoptionScore: 88 },
      { name: "Product", activeUsers: 15, aiMinutes: 2100, adoptionScore: 78 },
      { name: "Marketing", activeUsers: 24, aiMinutes: 1950, adoptionScore: 71 }
    ];

    return {
      success: true,
      data: { departments },
      sources: [
        { sourceType: "department_telemetry", sourceId: `dept-telemetry-${context.orgId}` }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
