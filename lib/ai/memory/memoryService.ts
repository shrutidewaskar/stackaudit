import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { ChatSession, ChatMessage, ConversationMemory, OrganizationContext, UserPreferences } from "./types";

const SESSIONS_KEY = "stackaudit_mem_sessions";
const MESSAGES_KEY = "stackaudit_mem_messages";
const MEMORIES_KEY = "stackaudit_mem_summaries";
const ORG_CONTEXT_KEY = "stackaudit_mem_orgs";
const PREFS_KEY = "stackaudit_mem_prefs";

export class MemoryService {
  private static instance: MemoryService;

  private constructor() {}

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  // --- Local Fallback Accessors for isolated dev/test mode ---
  private getLocal<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(key) || "[]");
  }

  private saveLocal<T>(key: string, items: T[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(items));
    }
  }

  // --- Chat Sessions ---
  async saveSession(session: ChatSession): Promise<ChatSession> {
    if (isDevMockMode()) {
      const sessions = this.getLocal<ChatSession>(SESSIONS_KEY);
      const index = sessions.findIndex((s) => s.id === session.id);
      if (index > -1) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }
      this.saveLocal(SESSIONS_KEY, sessions);
      return session;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("chat_sessions")
      .upsert([{
        id: session.id,
        user_id: session.user_id,
        organization_id: session.organization_id,
        title: session.title,
        status: session.status,
        created_at: session.created_at,
        updated_at: session.updated_at,
        last_message_at: session.last_message_at,
        provider: session.provider,
        model: session.model,
        current_intent: session.current_intent || null,
        audit_id: session.audit_id || null
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [chat_sessions.save]: ${error.message}`);
    }
    return data;
  }

  async getSession(id: string): Promise<ChatSession | null> {
    if (isDevMockMode()) {
      return this.getLocal<ChatSession>(SESSIONS_KEY).find((s) => s.id === id) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [chat_sessions.get]: ${error.message}`);
    }
    return data || null;
  }

  async deleteSession(id: string): Promise<boolean> {
    if (isDevMockMode()) {
      const sessions = this.getLocal<ChatSession>(SESSIONS_KEY).filter((s) => s.id !== id);
      this.saveLocal(SESSIONS_KEY, sessions);
      const messages = this.getLocal<ChatMessage>(MESSAGES_KEY).filter((m) => m.session_id !== id);
      this.saveLocal(MESSAGES_KEY, messages);
      return true;
    }

    assertSupabaseConfigured();
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) {
      throw new Error(`Database Error [chat_sessions.delete]: ${error.message}`);
    }
    return true;
  }

  async listSessions(userId: string | null, orgId: string | null): Promise<ChatSession[]> {
    if (isDevMockMode()) {
      return this.getLocal<ChatSession>(SESSIONS_KEY).filter(
        (s) => (userId && s.user_id === userId) || (orgId && s.organization_id === orgId)
      );
    }

    assertSupabaseConfigured();
    let query = supabase.from("chat_sessions").select("*");
    if (orgId) {
      query = query.eq("organization_id", orgId);
    } else if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query.order("last_message_at", { ascending: false });
    if (error) {
      throw new Error(`Database Error [chat_sessions.list]: ${error.message}`);
    }
    return data || [];
  }

  // --- Chat Messages ---
  async saveMessage(msg: ChatMessage): Promise<ChatMessage> {
    if (isDevMockMode()) {
      const messages = this.getLocal<ChatMessage>(MESSAGES_KEY);
      messages.push(msg);
      this.saveLocal(MESSAGES_KEY, messages);
      return msg;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{
        id: msg.id,
        session_id: msg.session_id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata,
        token_count: msg.token_count,
        created_at: msg.created_at
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [chat_messages.save]: ${error.message}`);
    }
    return data;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    if (isDevMockMode()) {
      return this.getLocal<ChatMessage>(MESSAGES_KEY).filter((m) => m.session_id === sessionId);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Database Error [chat_messages.get]: ${error.message}`);
    }
    return data || [];
  }

  // --- Conversation Memory Summaries ---
  async saveConversationMemory(mem: ConversationMemory): Promise<ConversationMemory> {
    if (isDevMockMode()) {
      const memories = this.getLocal<ConversationMemory>(MEMORIES_KEY);
      const idx = memories.findIndex((m) => m.session_id === mem.session_id);
      if (idx > -1) memories[idx] = mem;
      else memories.push(mem);
      this.saveLocal(MEMORIES_KEY, memories);
      return mem;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("conversation_memory")
      .upsert([{
        id: mem.id,
        session_id: mem.session_id,
        summary: mem.summary,
        entities: mem.entities,
        topics: mem.topics,
        important_decisions: mem.important_decisions,
        last_updated: mem.last_updated
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [conversation_memory.save]: ${error.message}`);
    }
    return data;
  }

  async getConversationMemory(sessionId: string): Promise<ConversationMemory | null> {
    if (isDevMockMode()) {
      return this.getLocal<ConversationMemory>(MEMORIES_KEY).find((m) => m.session_id === sessionId) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("conversation_memory")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [conversation_memory.get]: ${error.message}`);
    }
    return data || null;
  }

  // --- Organization Context ---
  async saveOrganizationContext(ctx: OrganizationContext): Promise<OrganizationContext> {
    if (isDevMockMode()) {
      const orgs = this.getLocal<OrganizationContext>(ORG_CONTEXT_KEY);
      const idx = orgs.findIndex((o) => o.organization_id === ctx.organization_id);
      if (idx > -1) orgs[idx] = ctx;
      else orgs.push(ctx);
      this.saveLocal(ORG_CONTEXT_KEY, orgs);
      return ctx;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organization_context")
      .upsert([{
        organization_id: ctx.organization_id,
        company_name: ctx.company_name,
        industry: ctx.industry,
        company_size: ctx.company_size,
        governance_score: ctx.governance_score,
        current_stack: ctx.current_stack,
        connected_tools: ctx.connected_tools,
        known_preferences: ctx.known_preferences,
        last_updated: ctx.last_updated
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [organization_context.save]: ${error.message}`);
    }
    return data;
  }

  async getOrganizationContext(orgId: string): Promise<OrganizationContext | null> {
    if (isDevMockMode()) {
      return this.getLocal<OrganizationContext>(ORG_CONTEXT_KEY).find((o) => o.organization_id === orgId) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organization_context")
      .select("*")
      .eq("organization_id", orgId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [organization_context.get]: ${error.message}`);
    }
    return data || null;
  }

  // --- User Preferences ---
  async saveUserPreferences(prefs: UserPreferences): Promise<UserPreferences> {
    if (isDevMockMode()) {
      const allPrefs = this.getLocal<UserPreferences>(PREFS_KEY);
      const idx = allPrefs.findIndex((p) => p.user_id === prefs.user_id);
      if (idx > -1) allPrefs[idx] = prefs;
      else allPrefs.push(prefs);
      this.saveLocal(PREFS_KEY, allPrefs);
      return prefs;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert([{
        user_id: prefs.user_id,
        preferred_provider: prefs.preferred_provider,
        preferred_language: prefs.preferred_language,
        notification_preferences: prefs.notification_preferences,
        conversation_style: prefs.conversation_style,
        favorite_reports: prefs.favorite_reports
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [user_preferences.save]: ${error.message}`);
    }
    return data;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    if (isDevMockMode()) {
      return this.getLocal<UserPreferences>(PREFS_KEY).find((p) => p.user_id === userId) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [user_preferences.get]: ${error.message}`);
    }
    return data || null;
  }
}

export const memoryService = MemoryService.getInstance();
