import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import { Employee } from "./types";

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

    if (isDevMockMode()) {
      mockEmployees.set(fullEmp.id, fullEmp);
      return fullEmp;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("employees")
      .insert([fullEmp])
      .select()
      .single();

    if (error) throw new Error(`Database Error [employees.create]: ${error.message}`);
    return data;
  }

  async get(id: string): Promise<Employee | null> {
    if (isDevMockMode()) {
      return mockEmployees.get(id) || null;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Database Error [employees.get]: ${error.message}`);
    return data || null;
  }

  async list(orgId: string): Promise<Employee[]> {
    if (isDevMockMode()) {
      return Array.from(mockEmployees.values()).filter((e) => e.organization_id === orgId);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("organization_id", orgId);

    if (error) throw new Error(`Database Error [employees.list]: ${error.message}`);
    return data || [];
  }

  async delete(id: string): Promise<boolean> {
    if (isDevMockMode()) {
      return mockEmployees.delete(id);
    }

    assertSupabaseConfigured();
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw new Error(`Database Error [employees.delete]: ${error.message}`);
    return true;
  }
}

export const employeeService = EmployeeService.getInstance();
