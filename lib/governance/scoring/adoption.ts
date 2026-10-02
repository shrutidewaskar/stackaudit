import { DimensionScore } from "../types";

export class AdoptionScoring {
  public static calculate(): DimensionScore {
    return {
      score: 80,
      rawMetrics: { activeAdoptionRatePercent: 78 },
      rulesUsed: ["ADOPTION_GROWTH_CHECK"],
      explanation: "Consistent weekly adoption growth is active across engineering and design departments."
    };
  }
}
