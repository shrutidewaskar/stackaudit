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
  summary TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audits_created_at ON public.audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON public.audits(user_id);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_audit_id ON public.leads(audit_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Enable Row Level Security
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for audits
CREATE POLICY "Public read access to audits"
  ON public.audits
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audits"
  ON public.audits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own audits"
  ON public.audits
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for audit tools
CREATE POLICY "Public read access to audit_tools"
  ON public.audit_tools
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audit_tools"
  ON public.audit_tools
  FOR INSERT
  WITH CHECK (true);

-- Create policies for leads
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access to leads"
  ON public.leads
  FOR SELECT
  USING (true);

-- Chat Sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_intent TEXT,
  organization_id UUID,
  title TEXT,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  provider TEXT DEFAULT 'mock',
  model TEXT DEFAULT 'mock-model-v1'
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_audit_id ON public.chat_sessions(audit_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_organization_id ON public.chat_sessions(organization_id);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Conversation Context table
CREATE TABLE IF NOT EXISTS public.conversation_context (
  session_id UUID PRIMARY KEY REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  company_size INTEGER,
  budget NUMERIC,
  tools JSONB DEFAULT '[]'::jsonb NOT NULL,
  recommendations JSONB DEFAULT '[]'::jsonb NOT NULL,
  optimization_score NUMERIC,
  future_growth TEXT
);

-- Conversation Memory table
CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  summary TEXT,
  entities JSONB DEFAULT '[]'::jsonb NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb NOT NULL,
  important_decisions JSONB DEFAULT '[]'::jsonb NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversation_memory_session_id ON public.conversation_memory(session_id);

-- Organization Context table
CREATE TABLE IF NOT EXISTS public.organization_context (
  organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size INTEGER,
  governance_score NUMERIC DEFAULT 100,
  current_stack JSONB DEFAULT '[]'::jsonb NOT NULL,
  connected_tools JSONB DEFAULT '[]'::jsonb NOT NULL,
  known_preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY,
  preferred_provider TEXT DEFAULT 'mock',
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
  conversation_style TEXT DEFAULT 'professional',
  favorite_reports JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for chat sessions
CREATE POLICY "Public read access to chat_sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat_sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);

-- Policies for chat messages
CREATE POLICY "Public read access to chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Policies for conversation context
CREATE POLICY "Public read access to conversation_context" ON public.conversation_context FOR SELECT USING (true);
CREATE POLICY "Anyone can insert conversation_context" ON public.conversation_context FOR INSERT WITH CHECK (true);

-- Policies for conversation memory
CREATE POLICY "Public read access to conversation_memory" ON public.conversation_memory FOR SELECT USING (true);
CREATE POLICY "Anyone can insert conversation_memory" ON public.conversation_memory FOR INSERT WITH CHECK (true);

-- Policies for organization context
CREATE POLICY "Public read access to organization_context" ON public.organization_context FOR SELECT USING (true);
CREATE POLICY "Anyone can insert organization_context" ON public.organization_context FOR INSERT WITH CHECK (true);

-- Policies for user preferences
CREATE POLICY "Public read access to user_preferences" ON public.user_preferences FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_preferences" ON public.user_preferences FOR INSERT WITH CHECK (true);


-- Organizations
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

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  head TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update existing audits, leads, and chat sessions to reference organizations
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Enable RLS for new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
CREATE POLICY "Public read access to organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to organization_members" ON public.organization_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert organization_members" ON public.organization_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert departments" ON public.departments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Anyone can insert employees" ON public.employees FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workspaces" ON public.workspaces FOR INSERT WITH CHECK (true);


-- Persistent Raw Usage Events
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

-- Daily Usage Aggregations
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

-- Employee Daily Aggregations
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

-- Sync Telemetry Tracking Jobs
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

-- Enable RLS
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- Policies (Scoping access to public for mock validation, with future org constraints)
CREATE POLICY "Public read access to usage_events" ON public.usage_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert usage_events" ON public.usage_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to daily_usage" ON public.daily_usage FOR SELECT USING (true);
CREATE POLICY "Anyone can insert daily_usage" ON public.daily_usage FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to employee_usage_daily" ON public.employee_usage_daily FOR SELECT USING (true);
CREATE POLICY "Anyone can insert employee_usage_daily" ON public.employee_usage_daily FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access to sync_jobs" ON public.sync_jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sync_jobs" ON public.sync_jobs FOR INSERT WITH CHECK (true);


-- Governance Snapshot History
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

ALTER TABLE public.governance_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read access to governance_snapshots by organization members" 
ON public.governance_snapshots 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_snapshots.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Insert access to governance_snapshots by organization members" 
ON public.governance_snapshots 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_snapshots.organization_id
    AND organization_members.user_id = auth.uid()
  )
);


-- Governance Reports Schema
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

ALTER TABLE public.governance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read access to governance_reports by organization members" 
ON public.governance_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_reports.organization_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Insert access to governance_reports by organization members" 
ON public.governance_reports 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.organization_id = governance_reports.organization_id
    AND organization_members.user_id = auth.uid()
  )
);




