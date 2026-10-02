import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { OrganizationMember } from "./types";

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
    if (isDevMockMode()) {
      mockMembers.set(`${member.organization_id}-${member.user_id}`, member);
      return member;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organization_members")
      .insert([member])
      .select()
      .single();

    if (error) throw new Error(`Database Error [organization_members.add]: ${error.message}`);
    return data;
  }

  async getMember(orgId: string, userId: string): Promise<OrganizationMember | null> {
    if (isDevMockMode()) {
      return mockMembers.get(`${orgId}-${userId}`) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Database Error [organization_members.get]: ${error.message}`);
    return data || null;
  }

  async listMembers(orgId: string): Promise<OrganizationMember[]> {
    if (isDevMockMode()) {
      return Array.from(mockMembers.values()).filter((m) => m.organization_id === orgId);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", orgId);

    if (error) throw new Error(`Database Error [organization_members.list]: ${error.message}`);
    return data || [];
  }

  async hasPermission(orgId: string, userId: string, action: keyof RolePermissions): Promise<boolean> {
    const membership = await this.getMember(orgId, userId);
    if (!membership) return false;
    const permissions = ROLE_PERMISSIONS[membership.role];
    return permissions ? permissions[action] : false;
  }
}

export const membershipService = MembershipService.getInstance();
