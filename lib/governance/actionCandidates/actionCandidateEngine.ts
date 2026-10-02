import { ActionCandidate } from "../types";

export class ActionCandidateEngine {
  public static mapAction(findingType: string, findingId: string): { action: ActionCandidate; sourceFindingId: string } {
    let action: ActionCandidate = "MONITOR_USAGE_TREND";

    switch (findingType) {
      case "DORMANT_LICENSE":
        action = "REVIEW_LICENSE";
        break;
      case "LOW_UTILIZATION":
        action = "REVIEW_LICENSE";
        break;
      case "CAPABILITY_OVERLAP":
        action = "REVIEW_VENDOR_OVERLAP";
        break;
      case "UNAPPROVED_TOOL_USAGE":
        action = "INVESTIGATE_UNKNOWN_TOOL";
        break;
      case "STALE_SYNC":
        action = "CONNECT_DATA_SOURCE";
        break;
      case "LOW_ADOPTION_GROWTH":
        action = "REVIEW_DEPARTMENT_ADOPTION";
        break;
    }

    return {
      action,
      sourceFindingId: findingId
    };
  }
}
