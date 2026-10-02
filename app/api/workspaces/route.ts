import { NextRequest, NextResponse } from "next/server";
import { workspaceService } from "@/services/enterprise/WorkspaceService";
import { requireOrganizationMember, requirePermission } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const list = await workspaceService.list(authResult.auth.organizationId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing workspaces:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, "canEditDetails");
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { provider, displayName } = body;

    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    const ws = await workspaceService.create(authResult.auth.organizationId, provider, displayName);
    return NextResponse.json(ws, { status: 201 });
  } catch (error) {
    console.error("API error creating workspace:", error);
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

    const ws = await workspaceService.get(id);
    if (!ws || ws.organization_id !== authResult.auth.organizationId) {
      return NextResponse.json({ error: "Workspace not found in your organization" }, { status: 404 });
    }

    const success = await workspaceService.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API error deleting workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
