import { DimensionScore } from "../types";

export class RedundancyScoring {
  public static calculate(): DimensionScore {
    return {
      score: 65,
      rawMetrics: { capabilityOverlapsCount: 4 },
      rulesUsed: ["CAPABILITY_OVERLAP_CHECK"],
      explanation: "High vendor redundancy identified as Claude and ChatGPT share multiple whitelisted capabilities."
    };
  }
}
