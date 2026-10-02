import { supabase } from "@/lib/supabase";
import { Employee } from "./types";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export const mockEmployees = new Map<string, Employee>();

export class EmployeeService {
  private static instance: EmployeeService;

  private constructor() {
    this.seedEmployees();
  }

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  private seedEmployees() {
    const orgId = "novatech-labs-uuid";
    const deptIds = ["dept-eng", "dept-des", "dept-mkt", "dept-fin", "dept-ops"];
    
    const firstNames = ["John", "Jane", "Alex", "Emily", "Michael", "Sarah", "David", "Jessica", "James", "Sophia"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Taylor", "Anderson"];
    const jobTitles: Record<string, string[]> = {
      "dept-eng": ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer", "AI Researcher"],
      "dept-des": ["UI Designer", "UX Researcher", "Brand Designer", "Product Designer"],
      "dept-mkt": ["SEO Specialist", "Campaign Manager", "Copywriter", "Growth Marketer"],
      "dept-fin": ["Accountant", "Financial Analyst", "Procurement Manager"],
      "dept-ops": ["HR Coordinator", "Operations Analyst", "Office Manager"]
    };

    // Seed exactly 120 employees
    for (let i = 1; i <= 120; i++) {
      const id = `emp-${i}`;
      if (!mockEmployees.has(id)) {
        const deptId = deptIds[i % deptIds.length];
        const fName = firstNames[(i * 3) % firstNames.length];
        const lName = lastNames[(i * 7) % lastNames.length];
        const name = `${fName} ${lName} (${i})`;
        const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@novatech.com`;
        
        const titles = jobTitles[deptId];
        const jobTitle = titles[i % titles.length];

        mockEmployees.set(id, {
          id,
          organization_id: orgId,
          department_id: deptId,
          name,
          email,
          job_title: jobTitle,
          employment_status: i % 15 === 0 ? "on_leave" : "active",
          created_at: new Date().toISOString()
        });
      }
    }
  }

  async create(employee: Omit<Employee, "created_at">): Promise<Employee> {
    const fullEmp: Employee = {
      ...employee,
      created_at: new Date().toISOString()
    };

    if (!isSupabaseConfigured) {
      mockEmployees.set(fullEmp.id, fullEmp);
      return fullEmp;
    }

    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([fullEmp])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch {
      mockEmployees.set(fullEmp.id, fullEmp);
      return fullEmp;
    }
  }

  async get(id: string): Promise<Employee | null> {
    if (!isSupabaseConfigured) {
      return mockEmployees.get(id) || null;
    }
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return mockEmployees.get(id) || null;
    }
  }

  async list(orgId: string): Promise<Employee[]> {
    if (!isSupabaseConfigured) {
      return Array.from(mockEmployees.values()).filter((e) => e.organization_id === orgId);
    }
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("organization_id", orgId);
      if (error) throw error;
      return data || [];
    } catch {
      return Array.from(mockEmployees.values()).filter((e) => e.organization_id === orgId);
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return mockEmployees.delete(id);
    }
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch {
      return mockEmployees.delete(id);
    }
  }
}

export const employeeService = EmployeeService.getInstance();
