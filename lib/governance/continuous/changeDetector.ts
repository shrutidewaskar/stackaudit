import { GovernanceSnapshot, GovernanceFinding } from "../types";

export interface ScoreDelta {
  overall: number;
  visibility: number;
  utilization: number;
  adoption: number;
  redundancy: number;
  dataCompleteness: number;
}

export class ChangeDetectionService {
  public static compareSnapshots(curr: GovernanceSnapshot, prev: GovernanceSnapshot): ScoreDelta {
    return {
      overall: curr.overallScore - prev.overallScore,
      visibility: curr.visibilityScore - prev.visibilityScore,
      utilization: curr.utilizationScore - prev.utilizationScore,
      adoption: curr.adoptionScore - prev.adoptionScore,
      redundancy: curr.redundancyScore - prev.redundancyScore,
      dataCompleteness: curr.dataCompletenessScore - prev.dataCompletenessScore
    };
  }

  public static detectFindingChanges(
    curr: GovernanceFinding[],
    prev: GovernanceFinding[]
  ): { newFindings: GovernanceFinding[]; resolvedFindings: GovernanceFinding[] } {
    const prevIds = new Set(prev.map((f) => f.id));
    const currIds = new Set(curr.map((f) => f.id));

    const newFindings = curr.filter((f) => !prevIds.has(f.id));
    const resolvedFindings = prev.filter((f) => !currIds.has(f.id));

    return { newFindings, resolvedFindings };
  }
}
