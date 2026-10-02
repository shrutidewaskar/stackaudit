import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/ai/memory/sessionManager";
import { memoryService } from "@/lib/ai/memory/memoryService";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const { id } = await props.params;
    const session = await SessionManager.loadSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Enforce tenant isolation on session
    if (session.organization_id && session.organization_id !== authResult.auth.organizationId) {
      return NextResponse.json({ error: "Session not found in your organization" }, { status: 404 });
    }

    const messages = await memoryService.getMessages(id);
    const memorySummary = await memoryService.getConversationMemory(id);

    return NextResponse.json({
      session,
      messages,
      memorySummary
    });
  } catch (error) {
    console.error("API error loading session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const { id } = await props.params;
    const session = await SessionManager.loadSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.organization_id && session.organization_id !== authResult.auth.organizationId) {
      return NextResponse.json({ error: "Session not found in your organization" }, { status: 404 });
    }

    const success = await SessionManager.deleteSession(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error deleting session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
