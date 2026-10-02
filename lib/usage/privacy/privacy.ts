import { UsageEvent } from "../types/types";

export class PrivacyPolicy {
  // Explicit white-list of metadata variables allowed in StackAudit
  private static allowedKeys = new Set([
    "emailDomain",
    "activeSeconds",
    "idleSeconds",
    "tabState",
    "urlPath",
    "connectorStatus"
  ]);

  public static sanitize(event: UsageEvent): UsageEvent {
    const sanitizedMetadata: Record<string, any> = {};

    // Only allow whitelisted keys in the metadata blob
    if (event.metadata) {
      for (const [key, val] of Object.entries(event.metadata)) {
        if (this.allowedKeys.has(key)) {
          sanitizedMetadata[key] = val;
        }
      }
    }

    return {
      ...event,
      // Ensure zero prompts, keystrokes, clipboard contents, uploads, or task contents are ever stored
      metadata: sanitizedMetadata
    };
  }
}
