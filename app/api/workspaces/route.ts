import { NextRequest, NextResponse } from "next/server";
import { workspaceService } from "@/services/enterprise/WorkspaceService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    const list = await workspaceService.list(orgId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing workspaces:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, provider, displayName } = body;

    if (!orgId || !provider) {
      return NextResponse.json({ error: "Missing orgId or provider" }, { status: 400 });
    }

    const ws = await workspaceService.create(orgId, provider, displayName);
    return NextResponse.json(ws, { status: 201 });
  } catch (error) {
    console.error("API error creating workspace:", error);
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

    const success = await workspaceService.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API error deleting workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
