/**
 * Database type definitions for Supabase
 * These types align with the database schema
 */

export interface AuditRow {
  id: string;
  created_at: string;
  team_size: number;
  use_case: string;
  total_current_monthly_spend: number;
  total_optimized_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  percentage_saved: number;
  optimization_score: string;
  summary: string;
}

export interface AuditInsert {
  team_size: number;
  use_case: string;
  total_current_monthly_spend: number;
  total_optimized_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  percentage_saved: number;
  optimization_score: string;
  summary: string;
}

export interface AuditToolRow {
  id: string;
  audit_id: string;
  tool: string;
  current_plan: string;
  recommended_plan: string;
  monthly_spend: number;
  monthly_savings: number;
  reason: string;
  severity: string;
}

export interface AuditToolInsert {
  audit_id: string;
  tool: string;
  current_plan: string;
  recommended_plan: string;
  monthly_spend: number;
  monthly_savings: number;
  reason: string;
  severity: string;
}

export interface LeadRow {
  id: string;
  audit_id: string;
  email: string;
  company: string | null;
  role: string | null;
  team_size: string | null;
  created_at: string;
}

export interface LeadInsert {
  audit_id: string;
  email: string;
  company: string | null;
  role: string | null;
  team_size: string | null;
}

export interface Database {
  public: {
    Tables: {
      audits: {
        Row: AuditRow;
        Insert: AuditInsert;
        Update: Partial<AuditRow>;
      };
      audit_tools: {
        Row: AuditToolRow;
        Insert: AuditToolInsert;
        Update: Partial<AuditToolRow>;
      };
      leads: {
        Row: LeadRow;
        Insert: LeadInsert;
        Update: Partial<LeadRow>;
      };
    };
  };
}

export type Audit = AuditRow;
export type AuditTool = AuditToolRow;
export type Lead = LeadRow;
