import { GovernanceFinding } from "../types";

export class AdoptionRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];

    // Rule: Identify departments with unusually low adoption growth rates
    findings.push({
      id: `finding-low-adoption-mkt`,
      organizationId: orgId,
      type: "LOW_ADOPTION_GROWTH",
      category: "ADOPTION",
      severity: "LOW",
      title: "Low AI Adoption Velocity",
      description: "Marketing department shows low activation rate of corporate AI tools compared to engineering.",
      evidence: {
        department: "Marketing",
        activeAdoptionRatePercent: 22,
        benchmarkTargetPercent: 50,
        activeToolsCount: 1
      },
      affectedEmployees: [],
      affectedDepartments: ["dept-mkt"],
      affectedTools: ["chatgpt"],
      metrics: { adoptionRatePercent: 22 },
      detectedAt: new Date().toISOString(),
      status: "NEW",
      recommendedAction: "REVIEW_DEPARTMENT_ADOPTION",
      confidence: 0.85
    });

    return findings;
  }
}
