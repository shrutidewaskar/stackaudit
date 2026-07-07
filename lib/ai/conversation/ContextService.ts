import { getAudit } from "@/lib/database";
import { ConversationContext } from "./types";

export class ContextService {
  async buildContextFromAudit(auditId: string): Promise<ConversationContext> {
    try {
      const { audit, tools, error } = await getAudit(auditId);
      if (error || !audit) {
        return { session_id: "" };
      }

      return {
        session_id: "",
        company_size: audit.team_size,
        budget: Number(audit.total_current_monthly_spend),
        optimization_score: parseFloat(audit.optimization_score) || 75,
        tools: tools.map((t) => ({
          name: t.tool,
          plan: t.current_plan,
          spend: Number(t.monthly_spend)
        })),
        recommendations: tools.map((t) => ({
          tool: t.tool,
          action: t.recommended_plan,
          saving: Number(t.monthly_savings),
          reason: t.reason
        }))
      };
    } catch (err) {
      console.warn("ContextService: Failed to compile context from database record.", err);
      return { session_id: "" };
    }
  }
}

export const contextService = new ContextService();
