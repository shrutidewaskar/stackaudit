import { supabase } from "@/lib/supabase";
import { OrganizationMember } from "./types";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export const mockMembers = new Map<string, OrganizationMember>();

export type RoleType = "owner" | "admin" | "manager" | "member" | "viewer";

export interface RolePermissions {
  canDeleteOrg: boolean;
  canManageMembers: boolean;
  canEditDetails: boolean;
  canViewAudits: boolean;
  canRunAudits: boolean;
}

export const ROLE_PERMISSIONS: Record<RoleType, RolePermissions> = {
  owner: { canDeleteOrg: true, canManageMembers: true, canEditDetails: true, canViewAudits: true, canRunAudits: true },
  admin: { canDeleteOrg: false, canManageMembers: true, canEditDetails: true, canViewAudits: true, canRunAudits: true },
  manager: { canDeleteOrg: false, canManageMembers: false, canEditDetails: true, canViewAudits: true, canRunAudits: true },
  member: { canDeleteOrg: false, canManageMembers: false, canEditDetails: false, canViewAudits: true, canRunAudits: true },
  viewer: { canDeleteOrg: false, canManageMembers: false, canEditDetails: false, canViewAudits: true, canRunAudits: false }
};

export class MembershipService {
  private static instance: MembershipService;

  private constructor() {
    this.seedMembers();
  }

  public static getInstance(): MembershipService {
    if (!MembershipService.instance) {
      MembershipService.instance = new MembershipService();
    }
    return MembershipService.instance;
  }

  private seedMembers() {
    const orgId = "novatech-labs-uuid";
    const defaultUser = "user-uuid-1";
    if (!mockMembers.has(`${orgId}-${defaultUser}`)) {
      mockMembers.set(`${orgId}-${defaultUser}`, {
        organization_id: orgId,
        user_id: defaultUser,
        role: "owner",
        status: "active",
        joined_at: new Date().toISOString()
      });
    }
  }

  async addMember(member: OrganizationMember): Promise<OrganizationMember> {
    if (!isSupabaseConfigured) {
      mockMembers.set(`${member.organization_id}-${member.user_id}`, member);
      return member;
    }
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .insert([member])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch {
      mockMembers.set(`${member.organization_id}-${member.user_id}`, member);
      return member;
    }
  }

  async getMember(orgId: string, userId: string): Promise<OrganizationMember | null> {
    if (!isSupabaseConfigured) {
      return mockMembers.get(`${orgId}-${userId}`) || null;
    }
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", orgId)
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return mockMembers.get(`${orgId}-${userId}`) || null;
    }
  }

  async listMembers(orgId: string): Promise<OrganizationMember[]> {
    if (!isSupabaseConfigured) {
      return Array.from(mockMembers.values()).filter((m) => m.organization_id === orgId);
    }
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", orgId);
      if (error) throw error;
      return data || [];
    } catch {
      return Array.from(mockMembers.values()).filter((m) => m.organization_id === orgId);
    }
  }

  async hasPermission(orgId: string, userId: string, action: keyof RolePermissions): Promise<boolean> {
    const membership = await this.getMember(orgId, userId);
    if (!membership) return false;
    const permissions = ROLE_PERMISSIONS[membership.role];
    return permissions ? permissions[action] : false;
  }
}

export const membershipService = MembershipService.getInstance();
