import { NextRequest, NextResponse } from "next/server";
import { employeeService } from "@/services/enterprise/EmployeeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    const list = await employeeService.list(orgId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing employees:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, orgId, departmentId, name, email, jobTitle, status } = body;

    if (!orgId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const empId = id || `emp-${Math.random().toString(36).substring(2)}`;
    const emp = await employeeService.create({
      id: empId,
      organization_id: orgId,
      department_id: departmentId || null,
      name,
      email,
      job_title: jobTitle || null,
      employment_status: status || "active"
    });
    return NextResponse.json(emp, { status: 201 });
  } catch (error) {
    console.error("API error creating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const success = await employeeService.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API error deleting employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
