import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/ai/memory/sessionManager";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orgId, title, provider, model, auditId } = body;

    const session = await SessionManager.createSession({
      userId: userId || null,
      orgId: orgId || null,
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
