import { NextRequest, NextResponse } from "next/server";
import { departmentService } from "@/services/enterprise/DepartmentService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    const list = await departmentService.list(orgId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing departments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, name, description, head } = body;

    if (!orgId || !name) {
      return NextResponse.json({ error: "Missing orgId or name" }, { status: 400 });
    }

    const dept = await departmentService.create(orgId, name, description, head);
    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    console.error("API error creating department:", error);
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

    const success = await departmentService.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API error deleting department:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
