import { memoryService } from "./memoryService";
import { ChatSession } from "./types";

export class SessionManager {
  public static async createSession(params: {
    userId: string | null;
    orgId: string | null;
    title?: string;
    provider?: string;
    model?: string;
    auditId?: string | null;
  }): Promise<ChatSession> {
    const now = new Date().toISOString();
    const session: ChatSession = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      organization_id: params.orgId,
      user_id: params.userId,
      title: params.title || "New Conversation",
      status: "active",
      created_at: now,
      updated_at: now,
      last_message_at: now,
      provider: params.provider || "mock",
      model: params.model || "mock-model-v1",
      current_intent: null,
      audit_id: params.auditId || null
    };

    return await memoryService.saveSession(session);
  }

  public static async loadSession(id: string): Promise<ChatSession | null> {
    return await memoryService.getSession(id);
  }

  public static async archiveSession(id: string): Promise<ChatSession> {
    const session = await memoryService.getSession(id);
    if (!session) {
      throw new Error(`Session with ID "${id}" not found.`);
    }

    session.status = "archived";
    session.updated_at = new Date().toISOString();
    return await memoryService.saveSession(session);
  }

  public static async deleteSession(id: string): Promise<boolean> {
    return await memoryService.deleteSession(id);
  }

  public static async renameSession(id: string, newTitle: string): Promise<ChatSession> {
    const session = await memoryService.getSession(id);
    if (!session) {
      throw new Error(`Session with ID "${id}" not found.`);
    }

    session.title = newTitle;
    session.updated_at = new Date().toISOString();
    return await memoryService.saveSession(session);
  }

  public static async listSessions(userId: string | null, orgId: string | null): Promise<ChatSession[]> {
    return await memoryService.listSessions(userId, orgId);
  }

  public static async searchSessions(params: {
    userId: string | null;
    orgId: string | null;
    query: string;
  }): Promise<ChatSession[]> {
    const all = await memoryService.listSessions(params.userId, params.orgId);
    const q = params.query.toLowerCase();
    return all.filter((s) => s.title.toLowerCase().includes(q));
  }
}
