import { GovernanceFinding } from "../types";

export class UnknownToolRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];

    // Rule: Unapproved AI usage indicators
    findings.push({
      id: `finding-unapproved-tool-deepseek`,
      organizationId: orgId,
      type: "UNAPPROVED_TOOL_USAGE",
      category: "SECURITY",
      severity: "MEDIUM",
      title: "Potential unapproved AI usage detected",
      description: "Observed active usage events hitting deepseek.com domain outside standard enterprise SSO routes.",
      evidence: {
        domain: "deepseek.com",
        recordedActiveSessions: 14,
        ssoBound: false,
        deviceTypes: ["macOS", "Windows"]
      },
      affectedEmployees: [],
      affectedDepartments: ["dept-eng"],
      affectedTools: ["deepseek"],
      metrics: { sessionCount: 14 },
      detectedAt: new Date().toISOString(),
      status: "NEW",
      recommendedAction: "INVESTIGATE_UNKNOWN_TOOL",
      confidence: 0.95
    });

    return findings;
  }
}
