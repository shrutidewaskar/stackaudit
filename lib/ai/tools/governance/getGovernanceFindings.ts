import { ToolDefinition, ToolResult } from "../types";
import { GovernanceEngine } from "../../../governance/engine";

export class GetGovernanceFindingsTool implements ToolDefinition {
  public name = "get_governance_findings";
  public description = "Retrieves active evidence-backed findings for the organization, support optional filtering by category and severity.";
  public category = "GOVERNANCE" as const;
  public requiredPermissions = ["VIEW_GOVERNANCE" as const];
  public inputSchema = {
    type: "object",
    properties: {
      organizationId: { type: "string" },
      severity: { type: "string" },
      category: { type: "string" }
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
    let findings = GovernanceEngine.generateFindings(context.orgId);

    if (args.severity) {
      findings = findings.filter((f) => f.severity === args.severity);
    }
    if (args.category) {
      findings = findings.filter((f) => f.category === args.category);
    }

    // Enforce size limits: max 20 findings returned
    const sliced = findings.slice(0, 20);

    return {
      success: true,
      data: {
        findings: sliced
      },
      sources: sliced.map((f) => ({ sourceType: "governance_finding", sourceId: f.id })),
      metadata: {
        generatedAt: new Date().toISOString(),
        dataCoverage: 87
      }
    };
  }
}
