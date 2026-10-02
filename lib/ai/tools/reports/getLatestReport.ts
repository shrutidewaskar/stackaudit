import { ToolDefinition, ToolResult } from "../types";

export class GetLatestReportTool implements ToolDefinition {
  public name = "get_latest_report";
  public description = "Retrieves the latest finalized executive governance report for the organization.";
  public category = "REPORTS" as const;
  public requiredPermissions = ["VIEW_REPORTS" as const];
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
        reportId: "report-weekly-latest",
        title: "Weekly Executive Governance Digest",
        compiledAt: new Date().toISOString(),
        summary: "Adoption remained stable. Utilization score improved by 2% due to license reclamation."
      },
      sources: [
        { sourceType: "governance_report", sourceId: "report-weekly-latest" }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
