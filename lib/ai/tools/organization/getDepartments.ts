import { ToolDefinition, ToolResult } from "../types";

export class GetDepartmentsTool implements ToolDefinition {
  public name = "get_departments";
  public description = "Retrieves departments configured under the organization.";
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
    const departments = [
      { id: "dept-1", name: "Engineering", head: "Alice Dev" },
      { id: "dept-2", name: "Product Management", head: "Bob Prod" },
      { id: "dept-3", name: "Marketing", head: "Charlie Mark" }
    ];

    return {
      success: true,
      data: { departments },
      sources: departments.map((d) => ({ sourceType: "department", sourceId: d.id })),
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
