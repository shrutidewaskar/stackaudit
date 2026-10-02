import { ChatMessage, OrganizationContext, UserPreferences } from "./types";

export interface ContextBuilderInput {
  currentAudit?: any;
  organizationProfile?: OrganizationContext | null;
  previousReports?: any[];
  conversationSummary?: string;
  currentQuestion: string;
  recommendations?: any[];
  userPreferences?: UserPreferences | null;
  governanceMetrics?: {
    overallScore: number;
    unauthorizedAppsCount: number;
    costRedundancyRatio: number;
  };
  recentHistory?: ChatMessage[];
  topics?: string[];
  entities?: string[];
}

export interface StructuredLLMContext {
  formattedSystemContext: string;
  formattedUserPrompt: string;
  tokenEstCount: number;
  meta: {
    hasProfile: boolean;
    hasAudit: boolean;
    hasPreferences: boolean;
    historySize: number;
  };
}

export class ContextBuilder {
  public static build(input: ContextBuilderInput): StructuredLLMContext {
    const systemSections: string[] = [];

    // 1. Add Organization Profile details
    if (input.organizationProfile) {
      const org = input.organizationProfile;
      systemSections.push(
        `[ORGANIZATION INFORMATION]\n` +
        `- Company: ${org.company_name}\n` +
        `- Industry: ${org.industry || "Not Specified"}\n` +
        `- Company Size: ${org.company_size || "Not Specified"} seats\n` +
        `- Governance Score: ${org.governance_score}/100\n` +
        `- Connected Tools: ${org.connected_tools.join(", ") || "None"}`
      );
    }

    // 2. Add Governance metrics if present
    if (input.governanceMetrics) {
      const gov = input.governanceMetrics;
      systemSections.push(
        `[GOVERNANCE & AUDIT METRICS]\n` +
        `- Overall Governance Score: ${gov.overallScore}/100\n` +
        `- Detected Unauthorized Apps: ${gov.unauthorizedAppsCount}\n` +
        `- Cost Redundancy Ratio: ${gov.costRedundancyRatio}%`
      );
    }

    // 3. User Preferences
    if (input.userPreferences) {
      const prefs = input.userPreferences;
      systemSections.push(
        `[USER PREFERENCES & POLICY]\n` +
        `- Style: ${prefs.conversation_style}\n` +
        `- Language: ${prefs.preferred_language}\n` +
        `- Preferred Provider/Model: ${prefs.preferred_provider}`
      );
    }

    // 4. Conversation Summary (Level 2 memory)
    if (input.conversationSummary) {
      systemSections.push(
        `[PREVIOUS SESSION CONTEXT SUMMARY]\n` +
        `${input.conversationSummary}\n` +
        (input.entities && input.entities.length > 0 ? `- Relevant Entities: ${input.entities.join(", ")}\n` : "") +
        (input.topics && input.topics.length > 0 ? `- Topics Discussed: ${input.topics.join(", ")}` : "")
      );
    }

    // 5. Audit Details and Recommendations
    if (input.currentAudit) {
      systemSections.push(
        `[ACTIVE AUDIT DATA]\n` +
        `${JSON.stringify(input.currentAudit, null, 2)}`
      );
    }

    if (input.recommendations && input.recommendations.length > 0) {
      systemSections.push(
        `[RECOMMENDED ACTIONS]\n` +
        `${JSON.stringify(input.recommendations, null, 2)}`
      );
    }

    // 6. Assemble History (Level 1 memory)
    if (input.recentHistory && input.recentHistory.length > 0) {
      const histStr = input.recentHistory
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
      systemSections.push(`[RECENT CHAT TRANSACTIONS]\n${histStr}`);
    }

    const formattedSystemContext = systemSections.join("\n\n");
    const formattedUserPrompt = `Question: ${input.currentQuestion}`;

    // Simple token estimator (character count / 4)
    const tokenEstCount = Math.ceil((formattedSystemContext.length + formattedUserPrompt.length) / 4);

    return {
      formattedSystemContext,
      formattedUserPrompt,
      tokenEstCount,
      meta: {
        hasProfile: !!input.organizationProfile,
        hasAudit: !!input.currentAudit,
        hasPreferences: !!input.userPreferences,
        historySize: input.recentHistory ? input.recentHistory.length : 0
      }
    };
  }
}
