export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  company_size: number | null;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "member" | "viewer";
  status: "active" | "pending" | "suspended";
  joined_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  head: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  organization_id: string;
  department_id: string | null;
  name: string;
  email: string;
  job_title: string | null;
  employment_status: "active" | "inactive" | "on_leave";
  created_at: string;
}

export interface Workspace {
  id: string;
  organization_id: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  display_name: string | null;
  created_at: string;
}
