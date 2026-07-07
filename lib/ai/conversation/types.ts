export type IntentType =
  | "Optimization"
  | "Planning"
  | "Comparison"
  | "Forecasting"
  | "Procurement"
  | "Exploration"
  | "Greeting"
  | "Help";

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: any;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string | null;
  audit_id: string | null;
  created_at: string;
  updated_at: string;
  current_intent: IntentType | null;
}

export interface ConversationContext {
  session_id: string;
  company_size?: number;
  budget?: number;
  tools?: any[];
  recommendations?: any[];
  optimization_score?: number;
  future_growth?: string;
}

export interface SuggestedAction {
  label: string;
  prompt: string;
}
