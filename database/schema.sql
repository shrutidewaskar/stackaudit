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
  current_intent TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_audit_id ON public.chat_sessions(audit_id);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
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

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_context ENABLE ROW LEVEL SECURITY;

-- Policies for chat sessions
CREATE POLICY "Public read access to chat_sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat_sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);

-- Policies for chat messages
CREATE POLICY "Public read access to chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Policies for conversation context
CREATE POLICY "Public read access to conversation_context" ON public.conversation_context FOR SELECT USING (true);
CREATE POLICY "Anyone can insert conversation_context" ON public.conversation_context FOR INSERT WITH CHECK (true);
