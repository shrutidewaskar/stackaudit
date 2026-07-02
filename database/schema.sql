-- StackAudit Database Schema

-- Audits table
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  team_size INTEGER NOT NULL,
  use_case TEXT NOT NULL,
  total_current_monthly_spend NUMERIC NOT NULL,
  total_optimized_monthly_spend NUMERIC NOT NULL,
  total_monthly_savings NUMERIC NOT NULL,
  total_annual_savings NUMERIC NOT NULL,
  percentage_saved NUMERIC NOT NULL,
  optimization_score TEXT NOT NULL,
  summary TEXT NOT NULL
);

CREATE INDEX idx_audits_created_at ON public.audits(created_at DESC);

-- Audit Tools table
CREATE TABLE IF NOT EXISTS public.audit_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  current_plan TEXT NOT NULL,
  recommended_plan TEXT NOT NULL,
  monthly_spend NUMERIC NOT NULL,
  monthly_savings NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL
);

CREATE INDEX idx_audit_tools_audit_id ON public.audit_tools(audit_id);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  team_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_leads_audit_id ON public.leads(audit_id);
CREATE INDEX idx_leads_email ON public.leads(email);

-- Enable Row Level Security (optional for public access)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to audits (for share pages)
CREATE POLICY "Public read access to audits"
  ON public.audits
  FOR SELECT
  USING (true);

CREATE POLICY "Public read access to audit_tools"
  ON public.audit_tools
  FOR SELECT
  USING (true);

-- Allow inserts to leads
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);
