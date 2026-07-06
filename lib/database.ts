import { supabase } from "@/lib/supabase";
import type { Audit, AuditTool, Lead, AuditInsert, AuditToolInsert, LeadInsert } from "@/types/database";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// In-memory store for fallback when Supabase is not configured
const mockAudits = new Map<string, Audit>();
const mockAuditTools = new Map<string, AuditTool[]>();
const mockLeads = new Map<string, Lead[]>();

/**
 * Save a complete audit with all tools and recommendations
 */
export async function saveAudit(
  teamSize: number,
  useCase: string,
  auditData: {
    totalCurrentMonthlySpend: number;
    totalOptimizedMonthlySpend: number;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    percentageSaved: number;
    optimizationScore: string;
    summary: string;
  },
  tools: {
    tool: string;
    currentPlan: string;
    recommendedPlan: string;
    monthlySpend: number;
    monthlySavings: number;
    reason: string;
    severity: string;
  }[],
  userId: string | null = null
): Promise<{ id: string; error: string | null }> {
  if (!isSupabaseConfigured) {
    try {
      const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const auditRow: Audit = {
        id,
        created_at: new Date().toISOString(),
        team_size: teamSize,
        use_case: useCase,
        total_current_monthly_spend: auditData.totalCurrentMonthlySpend,
        total_optimized_monthly_spend: auditData.totalOptimizedMonthlySpend,
        total_monthly_savings: auditData.totalMonthlySavings,
        total_annual_savings: auditData.totalAnnualSavings,
        percentage_saved: auditData.percentageSaved,
        optimization_score: auditData.optimizationScore,
        summary: auditData.summary,
        user_id: userId,
      };

      mockAudits.set(id, auditRow);

      const toolRows: AuditTool[] = tools.map((tool) => ({
        id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36),
        audit_id: id,
        tool: tool.tool,
        current_plan: tool.currentPlan,
        recommended_plan: tool.recommendedPlan,
        monthly_spend: tool.monthlySpend,
        monthly_savings: tool.monthlySavings,
        reason: tool.reason,
        severity: tool.severity,
      }));

      mockAuditTools.set(id, toolRows);

      return { id, error: null };
    } catch (error) {
      return {
        id: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  try {
    const auditInsert: AuditInsert = {
      team_size: teamSize,
      use_case: useCase,
      total_current_monthly_spend: auditData.totalCurrentMonthlySpend,
      total_optimized_monthly_spend: auditData.totalOptimizedMonthlySpend,
      total_monthly_savings: auditData.totalMonthlySavings,
      total_annual_savings: auditData.totalAnnualSavings,
      percentage_saved: auditData.percentageSaved,
      optimization_score: auditData.optimizationScore,
      summary: auditData.summary,
      user_id: userId,
    };

    // Insert audit
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .insert([auditInsert])
      .select("id")
      .single();

    if (auditError || !audit) {
      return { id: "", error: auditError?.message || "Failed to save audit" };
    }

    // Insert audit tools
    if (tools.length > 0) {
      const toolInserts: AuditToolInsert[] = tools.map((tool) => ({
        audit_id: audit.id,
        tool: tool.tool,
        current_plan: tool.currentPlan,
        recommended_plan: tool.recommendedPlan,
        monthly_spend: tool.monthlySpend,
        monthly_savings: tool.monthlySavings,
        reason: tool.reason,
        severity: tool.severity,
      }));

      const { error: toolsError } = await supabase.from("audit_tools").insert(toolInserts);

      if (toolsError) {
        return { id: audit.id, error: toolsError.message };
      }
    }

    return { id: audit.id, error: null };
  } catch (error) {
    return {
      id: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Retrieve a complete audit by ID
 */
export async function getAudit(
  id: string
): Promise<{
  audit: Audit | null;
  tools: AuditTool[];
  error: string | null;
}> {
  if (!isSupabaseConfigured) {
    const audit = mockAudits.get(id) || null;
    const tools = mockAuditTools.get(id) || [];
    return {
      audit,
      tools,
      error: audit ? null : "Audit not found",
    };
  }

  try {
    // Get audit
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (auditError) {
      return { audit: null, tools: [], error: auditError.message };
    }

    if (!audit) {
      return {
        audit: null,
        tools: [],
        error: "Audit not found",
      };
    }

    // Get audit tools
    const { data: tools, error: toolsError } = await supabase
      .from("audit_tools")
      .select("*")
      .eq("audit_id", id);

    if (toolsError) {
      return { audit, tools: [], error: toolsError.message };
    }

    return { audit, tools: tools || [], error: null };
  } catch (error) {
    return {
      audit: null,
      tools: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Save a lead for an audit
 */
export async function saveLead(
  auditId: string,
  email: string,
  company: string | null,
  role: string | null,
  teamSize: string | null
): Promise<{ id: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    try {
      const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const leadRow: Lead = {
        id,
        audit_id: auditId,
        email,
        company,
        role,
        team_size: teamSize,
        created_at: new Date().toISOString(),
      };

      const existingLeads = mockLeads.get(auditId) || [];
      existingLeads.push(leadRow);
      mockLeads.set(auditId, existingLeads);

      return { id, error: null };
    } catch (error) {
      return {
        id: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  try {
    const leadInsert: LeadInsert = {
      audit_id: auditId,
      email,
      company,
      role,
      team_size: teamSize,
    };

    const { data, error } = await supabase
      .from("leads")
      .insert([leadInsert])
      .select("id")
      .single();

    if (error) {
      return { id: null, error: error.message };
    }

    return { id: data?.id || null, error: null };
  } catch (error) {
    return {
      id: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get leads for an audit
 */
export async function getLeads(auditId: string): Promise<Lead[]> {
  if (!isSupabaseConfigured) {
    return mockLeads.get(auditId) || [];
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("audit_id", auditId);

    if (error) {
      console.error("Error fetching leads:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}
