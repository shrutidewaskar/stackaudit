import { UsageEvent } from "../usage/types/types";

export class PrivacyService {
  private static sensitiveKeys = new Set([
    "prompt",
    "prompts",
    "response",
    "responses",
    "clipboard",
    "keystroke",
    "keystrokes",
    "screenshot",
    "screenshots",
    "document",
    "documents",
    "fileContents",
    "upload",
    "uploads",
    "email",
    "emails"
  ]);

  public static enforce(event: UsageEvent): { isSafe: boolean; sanitizedEvent: UsageEvent } {
    // Check if any prohibited field exists in metadata
    if (event.metadata) {
      for (const key of Object.keys(event.metadata)) {
        if (this.sensitiveKeys.has(key.toLowerCase())) {
          return { isSafe: false, sanitizedEvent: event };
        }
      }
    }

    // Return Whitelisted elements
    const allowedMetadata: Record<string, any> = {};
    if (event.metadata) {
      const allowedKeys = new Set(["emailDomain", "activeSeconds", "idleSeconds", "tabState"]);
      for (const [key, val] of Object.entries(event.metadata)) {
        if (allowedKeys.has(key)) {
          allowedMetadata[key] = val;
        }
      }
    }

    return {
      isSafe: true,
      sanitizedEvent: {
        ...event,
        metadata: allowedMetadata
      }
    };
  }
}
