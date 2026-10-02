import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/services/enterprise/OrganizationService";
import { requireOrganizationMember, requireRole } from "@/lib/auth/serverAuth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const authResult = await requireOrganizationMember(request, id);
    if ("response" in authResult) return authResult.response;

    const org = await organizationService.get(id);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error) {
    console.error("API error getting organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const authResult = await requireOrganizationMember(request, id, "admin");
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const updated = await organizationService.update(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("API error updating organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const authResult = await requireOrganizationMember(request, id, "owner");
    if ("response" in authResult) return authResult.response;

    const success = await organizationService.delete(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error deleting organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
