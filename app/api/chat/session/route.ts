import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/ai/memory/sessionManager";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { title, provider, model, auditId } = body;

    const session = await SessionManager.createSession({
      userId: authResult.auth.user.id,
      orgId: authResult.auth.organizationId,
      title: title || "New Conversation",
      provider: provider || "mock",
      model: model || "mock-model-v1",
      auditId: auditId || null
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("API error creating session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
