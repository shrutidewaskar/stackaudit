import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { Organization } from "./types";

// Fallback in-memory stores for isolated dev/test mode
export const mockOrganizations = new Map<string, Organization>();

export class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {
    this.seedNovaTech();
  }

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  private seedNovaTech() {
    const novaTechId = "novatech-labs-uuid";
    if (!mockOrganizations.has(novaTechId)) {
      mockOrganizations.set(novaTechId, {
        id: novaTechId,
        name: "NovaTech Labs",
        slug: "novatech-labs",
        industry: "Software Engineering & AI Research",
        company_size: 120,
        plan: "enterprise",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  async create(name: string, slug: string, industry?: string, size?: number): Promise<Organization> {
    const org: Organization = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      name,
      slug,
      industry: industry || null,
      company_size: size || null,
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDevMockMode()) {
      mockOrganizations.set(org.id, org);
      return org;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organizations")
      .insert([org])
      .select()
      .single();

    if (error) throw new Error(`Database Error [organizations.create]: ${error.message}`);
    return data;
  }

  async get(id: string): Promise<Organization | null> {
    if (isDevMockMode()) {
      return mockOrganizations.get(id) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Database Error [organizations.get]: ${error.message}`);
    return data || null;
  }

  async list(): Promise<Organization[]> {
    if (isDevMockMode()) {
      return Array.from(mockOrganizations.values());
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase.from("organizations").select("*");
    if (error) throw new Error(`Database Error [organizations.list]: ${error.message}`);
    return data || [];
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    if (isDevMockMode()) {
      const org = mockOrganizations.get(id);
      if (!org) throw new Error("Organization not found");
      const updated = { ...org, ...updates, updated_at: new Date().toISOString() };
      mockOrganizations.set(id, updated);
      return updated;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("organizations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Database Error [organizations.update]: ${error.message}`);
    return data;
  }

  async delete(id: string): Promise<boolean> {
    if (isDevMockMode()) {
      return mockOrganizations.delete(id);
    }

    assertSupabaseConfigured();
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) throw new Error(`Database Error [organizations.delete]: ${error.message}`);
    return true;
  }
}

export const organizationService = OrganizationService.getInstance();
