import { supabase } from "@/lib/supabase";
import { ChatSession, ChatMessage, ConversationContext } from "./types";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// LocalStorage Keys
const SESSIONS_KEY = "stackaudit_chat_sessions";
const MESSAGES_KEY = "stackaudit_chat_messages";
const CONTEXTS_KEY = "stackaudit_chat_contexts";

export class MemoryService {
  // In-memory / LocalStorage Fallbacks
  private getLocalSessions(): ChatSession[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  }

  private saveLocalSessions(sessions: ChatSession[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  private getLocalMessages(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  }

  private saveLocalMessages(messages: ChatMessage[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  }

  private getLocalContexts(): ConversationContext[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(CONTEXTS_KEY) || "[]");
  }

  private saveLocalContexts(contexts: ConversationContext[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONTEXTS_KEY, JSON.stringify(contexts));
    }
  }

  async createSession(userId: string | null, auditId: string | null): Promise<ChatSession> {
    const newSession: ChatSession = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      user_id: userId,
      audit_id: auditId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_intent: null
    };

    if (!isSupabaseConfigured) {
      const sessions = this.getLocalSessions();
      sessions.push(newSession);
      this.saveLocalSessions(sessions);
      return newSession;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert([{
          user_id: userId,
          audit_id: auditId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("MemoryService: Database error creating session. Falling back to local storage.", err);
      const sessions = this.getLocalSessions();
      sessions.push(newSession);
      this.saveLocalSessions(sessions);
      return newSession;
    }
  }

  async getSession(id: string): Promise<ChatSession | null> {
    if (!isSupabaseConfigured) {
      return this.getLocalSessions().find((s) => s.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch {
      return this.getLocalSessions().find((s) => s.id === id) || null;
    }
  }

  async getSessionsByUser(userId: string | null): Promise<ChatSession[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalSessions().filter((s) => s.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      return this.getLocalSessions().filter((s) => s.user_id === userId);
    }
  }

  async saveMessage(sessionId: string, role: "user" | "assistant" | "system", content: string, metadata: any = {}): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      session_id: sessionId,
      role,
      content,
      metadata,
      created_at: new Date().toISOString()
    };

    // Update session timestamp locally
    const sessions = this.getLocalSessions();
    const sIdx = sessions.findIndex(s => s.id === sessionId);
    if (sIdx !== -1) {
      sessions[sIdx].updated_at = new Date().toISOString();
      this.saveLocalSessions(sessions);
    }

    if (!isSupabaseConfigured) {
      const messages = this.getLocalMessages();
      messages.push(newMessage);
      this.saveLocalMessages(messages);
      return newMessage;
    }

    try {
      // Update session updated_at in DB
      await supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{
          session_id: sessionId,
          role,
          content,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("MemoryService: Database error saving message. Falling back to local storage.", err);
      const messages = this.getLocalMessages();
      messages.push(newMessage);
      this.saveLocalMessages(messages);
      return newMessage;
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured) {
      return this.getLocalMessages().filter((m) => m.session_id === sessionId);
    }

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch {
      return this.getLocalMessages().filter((m) => m.session_id === sessionId);
    }
  }

  async saveContext(context: ConversationContext): Promise<ConversationContext> {
    if (!isSupabaseConfigured) {
      const contexts = this.getLocalContexts();
      const idx = contexts.findIndex((c) => c.session_id === context.session_id);
      if (idx !== -1) {
        contexts[idx] = { ...contexts[idx], ...context };
      } else {
        contexts.push(context);
      }
      this.saveLocalContexts(contexts);
      return context;
    }

    try {
      const { data, error } = await supabase
        .from("conversation_context")
        .upsert([{
          session_id: context.session_id,
          company_size: context.company_size,
          budget: context.budget,
          tools: context.tools || [],
          recommendations: context.recommendations || [],
          optimization_score: context.optimization_score,
          future_growth: context.future_growth
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("MemoryService: Database error saving context. Falling back to local storage.", err);
      const contexts = this.getLocalContexts();
      const idx = contexts.findIndex((c) => c.session_id === context.session_id);
      if (idx !== -1) {
        contexts[idx] = { ...contexts[idx], ...context };
      } else {
        contexts.push(context);
      }
      this.saveLocalContexts(contexts);
      return context;
    }
  }

  async getContext(sessionId: string): Promise<ConversationContext | null> {
    if (!isSupabaseConfigured) {
      return this.getLocalContexts().find((c) => c.session_id === sessionId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("conversation_context")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch {
      return this.getLocalContexts().find((c) => c.session_id === sessionId) || null;
    }
  }
}

export const memoryService = new MemoryService();
