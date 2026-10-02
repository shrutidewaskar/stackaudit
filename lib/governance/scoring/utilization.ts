import { DimensionScore } from "../types";

export class UtilizationScoring {
  public static calculate(): DimensionScore {
    return {
      score: 70,
      rawMetrics: { dormantLicensesCount: 1, underusedToolsCount: 2 },
      rulesUsed: ["DORMANT_LICENSE_CHECK", "LOW_UTILIZATION_CHECK"],
      explanation: "Identified one dormant seat candidate and underutilized Cursor/Claude usage parameters."
    };
  }
}
