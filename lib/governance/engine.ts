import { GovernanceFinding, GovernanceScoreBreakdown, GovernanceSnapshot } from "./types";
import { DormantLicenseRule } from "./rules/dormantLicense";
import { LowUtilizationRule } from "./rules/lowUtilization";
import { CapabilityOverlapRule } from "./rules/capabilityOverlap";
import { DataStalenessRule } from "./rules/dataStaleness";
import { AdoptionRule } from "./rules/adoption";
import { UnknownToolRule } from "./rules/unknownTool";

import { VisibilityScoring } from "./scoring/visibility";
import { UtilizationScoring } from "./scoring/utilization";
import { AdoptionScoring } from "./scoring/adoption";
import { RedundancyScoring } from "./scoring/redundancy";
import { CompletenessScoring } from "./scoring/completeness";

export class GovernanceEngine {
  public static generateFindings(orgId: string): GovernanceFinding[] {
    return [
      ...DormantLicenseRule.evaluate(orgId),
      ...LowUtilizationRule.evaluate(orgId),
      ...CapabilityOverlapRule.evaluate(orgId),
      ...DataStalenessRule.evaluate(orgId),
      ...AdoptionRule.evaluate(orgId),
      ...UnknownToolRule.evaluate(orgId)
    ];
  }

  public static calculateScore(orgId: string): GovernanceScoreBreakdown {
    const visibility = VisibilityScoring.calculate();
    const utilization = UtilizationScoring.calculate();
    const adoption = AdoptionScoring.calculate();
    const redundancy = RedundancyScoring.calculate();
    const dataCompleteness = CompletenessScoring.calculate();

    const overallScore = Math.round(
      visibility.score * 0.2 +
      utilization.score * 0.3 +
      adoption.score * 0.2 +
      redundancy.score * 0.2 +
      dataCompleteness.score * 0.1
    );

    return {
      overallScore,
      dimensions: {
        visibility,
        utilization,
        adoption,
        redundancy,
        dataCompleteness
      }
    };
  }

  public static generateSnapshot(orgId: string): GovernanceSnapshot {
    const score = this.calculateScore(orgId);
    const findings = this.generateFindings(orgId);

    const critical = findings.filter((f) => f.severity === "CRITICAL").length;
    const high = findings.filter((f) => f.severity === "HIGH").length;
    const medium = findings.filter((f) => f.severity === "MEDIUM").length;

    return {
      id: `snap-${orgId}-${new Date().toISOString().substring(0, 10)}`,
      organizationId: orgId,
      snapshotDate: new Date().toISOString().substring(0, 10),
      overallScore: score.overallScore,
      visibilityScore: score.dimensions.visibility.score,
      utilizationScore: score.dimensions.utilization.score,
      adoptionScore: score.dimensions.adoption.score,
      redundancyScore: score.dimensions.redundancy.score,
      dataCompletenessScore: score.dimensions.dataCompleteness.score,
      findingCount: findings.length,
      criticalCount: critical,
      highCount: high,
      mediumCount: medium,
      createdAt: new Date().toISOString()
    };
  }
}
export const mockGovernanceSnapshotsDB: GovernanceSnapshot[] = [];
