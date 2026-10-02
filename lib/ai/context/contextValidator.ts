import { AIContext } from "./types";

export class AIContextValidator {
  public static validate(orgId: string, context: AIContext): boolean {
    // 1. Enforce strict organization boundary isolation
    if (context.organization.id !== orgId) {
      console.error(`[AIContextValidator] Isolation Violation: context org ${context.organization.id} !== requested ${orgId}`);
      return false;
    }

    // 2. Size limit checks (Token Budget bounds check)
    const jsonStr = JSON.stringify(context);
    const contextSizeKb = jsonStr.length / 1024;
    
    if (contextSizeKb > 500) { // 500KB cap limit check
      console.error(`[AIContextValidator] Budget Violation: context size ${contextSizeKb}KB exceeds 500KB budget.`);
      return false;
    }

    // 3. Privacy Policy checks
    const promptLeaked = jsonStr.toLowerCase().includes("prompt") && jsonStr.includes("client codes");
    if (promptLeaked) {
      console.error(`[AIContextValidator] Privacy Violation: Prompts detected in serialized context payload.`);
      return false;
    }

    return true;
  }
}
