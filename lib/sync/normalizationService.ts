export class NormalizationService {
  private static providerMap = new Map<string, string>([
    ["openai", "openai"],
    ["chatgpt", "openai"],
    ["chat.openai.com", "openai"],
    ["anthropic", "anthropic"],
    ["claude", "anthropic"],
    ["claude.ai", "anthropic"],
    ["google", "gemini"],
    ["gemini", "gemini"],
    ["gemini.google.com", "gemini"],
    ["cursor", "cursor"],
    ["cursor.sh", "cursor"],
    ["perplexity", "perplexity"],
    ["perplexity.ai", "perplexity"]
  ]);

  private static toolMap = new Map<string, string>([
    ["chat.openai.com", "chatgpt"],
    ["chatgpt", "chatgpt"],
    ["openai", "chatgpt"],
    ["claude.ai", "claude"],
    ["claude", "claude"],
    ["anthropic", "claude"],
    ["gemini.google.com", "gemini"],
    ["gemini", "gemini"],
    ["google", "gemini"],
    ["cursor.sh", "cursor"],
    ["cursor", "cursor"],
    ["perplexity.ai", "perplexity"],
    ["perplexity", "perplexity"]
  ]);

  public static normalizeProvider(input: string): string {
    const clean = input.trim().toLowerCase();
    return this.providerMap.get(clean) || clean;
  }

  public static normalizeTool(input: string): string {
    const clean = input.trim().toLowerCase();
    return this.toolMap.get(clean) || clean;
  }

  public static normalizeDomain(input: string): string {
    const clean = input.trim().toLowerCase();
    if (clean.includes("openai.com")) return "chat.openai.com";
    if (clean.includes("claude.ai")) return "claude.ai";
    if (clean.includes("gemini.google.com") || clean.includes("gemini")) return "gemini.google.com";
    if (clean.includes("cursor.sh") || clean.includes("cursor")) return "cursor.sh";
    if (clean.includes("perplexity")) return "perplexity.ai";
    return clean;
  }
}
