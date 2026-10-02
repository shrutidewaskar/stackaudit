import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { Department } from "./types";

export const mockDepartments = new Map<string, Department>();

export class DepartmentService {
  private static instance: DepartmentService;

  private constructor() {
    this.seedDepartments();
  }

  public static getInstance(): DepartmentService {
    if (!DepartmentService.instance) {
      DepartmentService.instance = new DepartmentService();
    }
    return DepartmentService.instance;
  }

  private seedDepartments() {
    const orgId = "novatech-labs-uuid";
    const depts = [
      { id: "dept-eng", name: "Engineering", description: "Product coding and systems development", head: "Shruti Dewaskar" },
      { id: "dept-des", name: "Design", description: "UI/UX planning and graphic design", head: "Alice Smith" },
      { id: "dept-mkt", name: "Marketing", description: "SEO, growth campaigns, and content branding", head: "Bob Jones" },
      { id: "dept-fin", name: "Finance", description: "Budget operations and investment analysis", head: "Charlie Brown" },
      { id: "dept-ops", name: "Operations", description: "Office systems, HR tools, and workflow logs", head: "Diana Prince" }
    ];

    depts.forEach((d) => {
      if (!mockDepartments.has(d.id)) {
        mockDepartments.set(d.id, {
          id: d.id,
          organization_id: orgId,
          name: d.name,
          description: d.description,
          head: d.head,
          created_at: new Date().toISOString()
        });
      }
    });
  }

  async create(orgId: string, name: string, description?: string, head?: string): Promise<Department> {
    const dept: Department = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      organization_id: orgId,
      name,
      description: description || null,
      head: head || null,
      created_at: new Date().toISOString()
    };

    if (isDevMockMode()) {
      mockDepartments.set(dept.id, dept);
      return dept;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("departments")
      .insert([dept])
      .select()
      .single();

    if (error) throw new Error(`Database Error [departments.create]: ${error.message}`);
    return data;
  }

  async get(id: string): Promise<Department | null> {
    if (isDevMockMode()) {
      return mockDepartments.get(id) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Database Error [departments.get]: ${error.message}`);
    return data || null;
  }

  async list(orgId: string): Promise<Department[]> {
    if (isDevMockMode()) {
      return Array.from(mockDepartments.values()).filter((d) => d.organization_id === orgId);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("organization_id", orgId);

    if (error) throw new Error(`Database Error [departments.list]: ${error.message}`);
    return data || [];
  }

  async delete(id: string): Promise<boolean> {
    if (isDevMockMode()) {
      return mockDepartments.delete(id);
    }

    assertSupabaseConfigured();
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw new Error(`Database Error [departments.delete]: ${error.message}`);
    return true;
  }
}

export const departmentService = DepartmentService.getInstance();
