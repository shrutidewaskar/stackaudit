import { GovernanceFinding } from "../types";
import { GOVERNANCE_THRESHOLDS } from "../thresholds";

export class LowUtilizationRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];
    const lowUtilPercent = GOVERNANCE_THRESHOLDS.LOW_UTILIZATION_PERCENT;

    findings.push({
      id: `finding-low-util-emp-10`,
      organizationId: orgId,
      type: "LOW_UTILIZATION",
      category: "UTILIZATION",
      severity: "MEDIUM",
      title: "Low Utilization AI License",
      description: `Employee #emp-10 utilization is below ${lowUtilPercent}% of expected monthly active duration.`,
      evidence: {
        employeeId: "emp-10",
        expectedActiveMinutes: 300,
        actualActiveMinutes: 45,
        utilizationRate: "15%",
        licenseTier: "Enterprise"
      },
      affectedEmployees: ["emp-10"],
      affectedDepartments: ["dept-eng"],
      affectedTools: ["claude"],
      metrics: { utilizationRatePercent: 15 },
      detectedAt: new Date().toISOString(),
      status: "NEW",
      recommendedAction: "REVIEW_LICENSE",
      confidence: 0.95
    });

    return findings;
  }
}
