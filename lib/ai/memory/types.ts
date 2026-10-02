export interface ChatSession {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  title: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  last_message_at: string;
  provider: string;
  model: string;
  current_intent?: string | null;
  audit_id?: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, any>;
  token_count: number;
  created_at: string;
}

export interface ConversationMemory {
  id: string;
  session_id: string;
  summary: string;
  entities: string[];
  topics: string[];
  important_decisions: string[];
  last_updated: string;
}

export interface OrganizationContext {
  organization_id: string;
  company_name: string;
  industry: string;
  company_size: number;
  governance_score: number;
  current_stack: any[];
  connected_tools: string[];
  known_preferences: Record<string, any>;
  last_updated: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_provider: string;
  preferred_language: string;
  notification_preferences: Record<string, any>;
  conversation_style: string;
  favorite_reports: string[];
}

// Memory Tiers Wrapper
export interface MemoryContext {
  level1: {
    currentConversationId: string;
    recentMessages: ChatMessage[];
  };
  level2: {
    summary: string;
    entities: string[];
    topics: string[];
    importantDecisions: string[];
  };
  level3: {
    organization: OrganizationContext | null;
    userPreferences: UserPreferences | null;
    auditHistorySummary: string;
  };
}
