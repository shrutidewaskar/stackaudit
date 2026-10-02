import { GovernanceFinding } from "../types";
import { GOVERNANCE_THRESHOLDS } from "../thresholds";

export class DormantLicenseRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];
    const dormantDays = GOVERNANCE_THRESHOLDS.DORMANT_DAYS;

    // Deterministic simulation based on NovaTech Labs 30-day telemetry seeder where emp-5 is inactive
    findings.push({
      id: `finding-dormant-emp-5`,
      organizationId: orgId,
      type: "DORMANT_LICENSE",
      category: "UTILIZATION",
      severity: "HIGH",
      title: "Dormant License Detected",
      description: "Employee #emp-5 has zero recorded usage events during the configured observation window.",
      evidence: {
        licensedUsersCount: 1,
        activeUsersCount: 0,
        observationPeriod: `${dormantDays} days`,
        lastActivity: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        activeMinutes: 0,
        licenseType: "Business"
      },
      affectedEmployees: ["emp-5"],
      affectedDepartments: ["dept-eng"],
      affectedTools: ["cursor"],
      metrics: { dormantDays: 37 },
      detectedAt: new Date().toISOString(),
      status: "NEW",
      recommendedAction: "REVIEW_LICENSE",
      confidence: 1.0
    });

    return findings;
  }
}
