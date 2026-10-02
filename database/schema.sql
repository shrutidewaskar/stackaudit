-- StackAudit Database Schema & Multi-Tenant Security Model

-- 1. Audits table (Public intake & authenticated history)
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
  summary TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_organization_id ON public.audits(organization_id);

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

CREATE INDEX IF NOT EXISTS idx_audit_tools_audit_id ON public.audit_tools(audit_id);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  team_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_audit_id ON public.leads(audit_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  company_size INTEGER,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Memberships
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  head TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON public.workspaces(organization_id);

-- 3. Telemetry and Usage Events
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  workspace_id TEXT,
  connector_id TEXT,
  provider TEXT NOT NULL,
  tool TEXT NOT NULL,
  source TEXT NOT NULL,
  domain TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE NOT NULL,
  active_duration INTEGER NOT NULL,
  idle_duration INTEGER NOT NULL,
  tab_visibility TEXT,
  device TEXT,
  browser TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_events_org ON public.usage_events(organization_id);

CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  tool TEXT NOT NULL,
  department_id TEXT,
  active_users INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  active_minutes NUMERIC NOT NULL DEFAULT 0,
  idle_minutes NUMERIC NOT NULL DEFAULT 0,
  total_minutes NUMERIC NOT NULL DEFAULT 0,
  average_session_minutes NUMERIC NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (organization_id, date, provider, tool, department_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_org ON public.daily_usage(organization_id, date);

CREATE TABLE IF NOT EXISTS public.employee_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  department_id TEXT,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  tool TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  active_minutes NUMERIC NOT NULL DEFAULT 0,
  idle_minutes NUMERIC NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (organization_id, employee_id, date, provider, tool)
);

CREATE INDEX IF NOT EXISTS idx_emp_usage_org ON public.employee_usage_daily(organization_id, employee_id);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'partial', 'failed', 'retrying')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  events_received INTEGER DEFAULT 0,
  events_accepted INTEGER DEFAULT 0,
  events_rejected INTEGER DEFAULT 0,
  events_deduplicated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Governance Snapshots and Reports
CREATE TABLE IF NOT EXISTS public.governance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score NUMERIC NOT NULL,
  visibility_score NUMERIC NOT NULL,
  utilization_score NUMERIC NOT NULL,
  adoption_score NUMERIC NOT NULL,
  redundancy_score NUMERIC NOT NULL,
  data_completeness_score NUMERIC NOT NULL,
  finding_count INTEGER NOT NULL DEFAULT 0,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (organization_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS public.governance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('DAILY_SNAPSHOT', 'WEEKLY_DIGEST', 'MONTHLY_EXECUTIVE', 'QUARTERLY_REVIEW')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  content JSONB NOT NULL,
  metadata JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Chat and Intelligence Layer
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'active',
  current_intent TEXT,
  provider TEXT DEFAULT 'mock',
  model TEXT DEFAULT 'mock-model-v1',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_org ON public.chat_sessions(organization_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  summary TEXT,
  entities JSONB DEFAULT '[]'::jsonb NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb NOT NULL,
  important_decisions JSONB DEFAULT '[]'::jsonb NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Isolation via Organization Membership
-- -------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- 1. Public / Audit Policies (Intentionally supported public intake)
CREATE POLICY "Public can insert audits" ON public.audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own audits or organization audits" ON public.audits FOR SELECT USING (
  user_id = auth.uid() OR
  (organization_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = audits.organization_id
    AND organization_members.user_id = auth.uid()
  ))
);

CREATE POLICY "Public can insert audit_tools" ON public.audit_tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read audit_tools" ON public.audit_tools FOR SELECT USING (true);

CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Organization members can read leads" ON public.leads FOR SELECT USING (
  organization_id IS NULL OR EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = leads.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

-- 2. Organizations & Members Policies
CREATE POLICY "Members can view their organizations" ON public.organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = organizations.id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view membership list" ON public.organization_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members AS m
    WHERE m.organization_id = organization_members.organization_id
    AND m.user_id = auth.uid()
  )
);

-- 3. Tenant-Scoped Enterprise Tables
CREATE POLICY "Org members can read departments" ON public.departments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = departments.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org admins can manage departments" ON public.departments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = departments.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Org members can read employees" ON public.employees FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = employees.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org admins can manage employees" ON public.employees FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = employees.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin', 'manager')
  )
);

CREATE POLICY "Org members can read workspaces" ON public.workspaces FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = workspaces.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org admins can manage workspaces" ON public.workspaces FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = workspaces.organization_id
    AND organization_members.user_id = auth.uid()
    AND organization_members.role IN ('owner', 'admin', 'manager')
  )
);

-- 4. Usage, Telemetry & Governance
CREATE POLICY "Org members can read usage_events" ON public.usage_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = usage_events.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org members can insert usage_events" ON public.usage_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = usage_events.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read daily_usage" ON public.daily_usage FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = daily_usage.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org members can manage daily_usage" ON public.daily_usage FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = daily_usage.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read employee_usage_daily" ON public.employee_usage_daily FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = employee_usage_daily.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org members can manage employee_usage_daily" ON public.employee_usage_daily FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = employee_usage_daily.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read sync_jobs" ON public.sync_jobs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = sync_jobs.organization_id
    AND organization_members.user_id = auth.uid()
  )
);
CREATE POLICY "Org members can manage sync_jobs" ON public.sync_jobs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = sync_jobs.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read governance_snapshots" ON public.governance_snapshots FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_snapshots.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read governance_reports" ON public.governance_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_reports.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

-- 5. Chat & Memory
CREATE POLICY "Users can access own chat sessions in their organization" ON public.chat_sessions FOR ALL USING (
  user_id = auth.uid() OR (
    organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = chat_sessions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can access messages for accessible sessions" ON public.chat_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND (
      chat_sessions.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = chat_sessions.organization_id
        AND organization_members.user_id = auth.uid()
      )
    )
  )
);
