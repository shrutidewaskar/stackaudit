import { AIContext } from "./types";

export class AIContextCache {
  private static cache = new Map<string, { context: AIContext; cachedAt: number }>();
  private static TTL_MS = 60 * 1000; // 1 minute cache lifetime

  public static get(orgId: string, intent: string): AIContext | null {
    const key = `${orgId}:${intent}`;
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.cachedAt > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.context;
  }

  public static set(orgId: string, intent: string, context: AIContext): void {
    const key = `${orgId}:${intent}`;
    
    // Safety check to ensure cache is strictly organization isolated
    if (context.organization.id !== orgId) {
      throw new Error(`Security Violation: Organization ID mismatch in Cache write.`);
    }

    this.cache.set(key, {
      context,
      cachedAt: Date.now()
    });
  }

  public static clear(): void {
    this.cache.clear();
  }
}
