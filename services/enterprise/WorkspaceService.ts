import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { Workspace } from "./types";

export const mockWorkspaces = new Map<string, Workspace>();

export class WorkspaceService {
  private static instance: WorkspaceService;

  private constructor() {
    this.seedWorkspaces();
  }

  public static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }
    return WorkspaceService.instance;
  }

  private seedWorkspaces() {
    const orgId = "novatech-labs-uuid";
    const connections = [
      { id: "ws-google", provider: "google_workspace", display_name: "Google Workspace Production", status: "connected" as const },
      { id: "ws-slack", provider: "slack", display_name: "Slack Engineering Workspace", status: "connected" as const },
      { id: "ws-okta", provider: "okta", display_name: "Okta SSO Provider", status: "error" as const },
      { id: "ws-github", provider: "github", display_name: "GitHub Organization", status: "connected" as const }
    ];

    connections.forEach((conn) => {
      if (!mockWorkspaces.has(conn.id)) {
        mockWorkspaces.set(conn.id, {
          id: conn.id,
          organization_id: orgId,
          provider: conn.provider,
          status: conn.status,
          display_name: conn.display_name,
          created_at: new Date().toISOString()
        });
      }
    });
  }

  async create(orgId: string, provider: string, displayName?: string): Promise<Workspace> {
    const ws: Workspace = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      organization_id: orgId,
      provider,
      status: "connected",
      display_name: displayName || null,
      created_at: new Date().toISOString()
    };

    if (isDevMockMode()) {
      mockWorkspaces.set(ws.id, ws);
      return ws;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("workspaces")
      .insert([ws])
      .select()
      .single();

    if (error) throw new Error(`Database Error [workspaces.create]: ${error.message}`);
    return data;
  }

  async get(id: string): Promise<Workspace | null> {
    if (isDevMockMode()) {
      return mockWorkspaces.get(id) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Database Error [workspaces.get]: ${error.message}`);
    return data || null;
  }

  async list(orgId: string): Promise<Workspace[]> {
    if (isDevMockMode()) {
      return Array.from(mockWorkspaces.values()).filter((w) => w.organization_id === orgId);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("organization_id", orgId);

    if (error) throw new Error(`Database Error [workspaces.list]: ${error.message}`);
    return data || [];
  }

  async delete(id: string): Promise<boolean> {
    if (isDevMockMode()) {
      return mockWorkspaces.delete(id);
    }

    assertSupabaseConfigured();
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw new Error(`Database Error [workspaces.delete]: ${error.message}`);
    return true;
  }
}

export const workspaceService = WorkspaceService.getInstance();
