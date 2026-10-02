import { supabase } from "@/lib/supabase";
import { Organization } from "./types";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// Fallback in-memory stores for Milestone 2 mock data
export const mockOrganizations = new Map<string, Organization>();

export class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {
    // Automatically seed NovaTech Labs if empty
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

    if (!isSupabaseConfigured) {
      mockOrganizations.set(org.id, org);
      return org;
    }

    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert([org])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch {
      mockOrganizations.set(org.id, org);
      return org;
    }
  }

  async get(id: string): Promise<Organization | null> {
    if (!isSupabaseConfigured) {
      return mockOrganizations.get(id) || null;
    }
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return mockOrganizations.get(id) || null;
    }
  }

  async list(): Promise<Organization[]> {
    if (!isSupabaseConfigured) {
      return Array.from(mockOrganizations.values());
    }
    try {
      const { data, error } = await supabase.from("organizations").select("*");
      if (error) throw error;
      return data || [];
    } catch {
      return Array.from(mockOrganizations.values());
    }
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    const org = await this.get(id);
    if (!org) throw new Error("Organization not found");

    const updated = { ...org, ...updates, updated_at: new Date().toISOString() };

    if (!isSupabaseConfigured) {
      mockOrganizations.set(id, updated);
      return updated;
    }

    try {
      const { data, error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch {
      mockOrganizations.set(id, updated);
      return updated;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return mockOrganizations.delete(id);
    }
    try {
      const { error } = await supabase.from("organizations").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch {
      return mockOrganizations.delete(id);
    }
  }
}

export const organizationService = OrganizationService.getInstance();
