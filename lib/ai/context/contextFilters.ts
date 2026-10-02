export class AIContextPolicyFilters {
  private static blacklistKeys = [
    "password",
    "token",
    "cookie",
    "prompt",
    "response",
    "clipboard",
    "keystroke",
    "screenshot",
    "file",
    "document",
    "email",
    "privateChat",
    "secret"
  ];

  public static sanitize(data: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};

    for (const [key, val] of Object.entries(data)) {
      const isBlacklisted = this.blacklistKeys.some(
        (b) => key.toLowerCase().includes(b)
      );

      if (isBlacklisted) {
        clean[key] = "[REDACTED_PRIVACY_COMPLIANCE]";
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        clean[key] = this.sanitize(val);
      } else {
        clean[key] = val;
      }
    }

    return clean;
  }
}
