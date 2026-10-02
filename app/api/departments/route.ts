import { NextRequest, NextResponse } from "next/server";
import { departmentService } from "@/services/enterprise/DepartmentService";
import { requireOrganizationMember, requirePermission } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const list = await departmentService.list(authResult.auth.organizationId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing departments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, "canEditDetails");
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { name, description, head } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing department name" }, { status: 400 });
    }

    const dept = await departmentService.create(authResult.auth.organizationId, name, description, head);
    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    console.error("API error creating department:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, "canEditDetails");
    if ("response" in authResult) return authResult.response;

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const dept = await departmentService.get(id);
    if (!dept || dept.organization_id !== authResult.auth.organizationId) {
      return NextResponse.json({ error: "Department not found in your organization" }, { status: 404 });
    }

    const success = await departmentService.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API error deleting department:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
