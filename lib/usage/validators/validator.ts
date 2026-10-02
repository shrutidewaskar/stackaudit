import { UsageEvent } from "../types/types";

export class UsageEventValidator {
  private static validProviders = new Set([
    "google",
    "microsoft",
    "browser",
    "github",
    "slack",
    "openai",
    "anthropic",
    "gemini",
    "cursor",
    "perplexity",
    "jira",
    "linear"
  ]);

  public static validate(event: UsageEvent): { isValid: boolean; reason?: string } {
    if (!event.organizationId || event.organizationId.trim() === "") {
      return { isValid: false, reason: "Missing organizationId" };
    }
    if (!event.employeeId || event.employeeId.trim() === "") {
      return { isValid: false, reason: "Missing employeeId" };
    }
    if (event.activeDuration < 0) {
      return { isValid: false, reason: "Active duration cannot be negative" };
    }
    if (event.idleDuration < 0) {
      return { isValid: false, reason: "Idle duration cannot be negative" };
    }
    if (!this.validProviders.has(event.provider.toLowerCase())) {
      return { isValid: false, reason: `Unknown provider: ${event.provider}` };
    }
    
    // Corrupted timestamps check
    const start = Date.parse(event.sessionStart);
    const end = Date.parse(event.sessionEnd);
    if (isNaN(start) || isNaN(end)) {
      return { isValid: false, reason: "Invalid timestamp format" };
    }
    if (start > end) {
      return { isValid: false, reason: "Session start cannot be after session end" };
    }

    return { isValid: true };
  }
}
