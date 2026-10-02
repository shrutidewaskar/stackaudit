import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/ai/memory/sessionManager";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const sessions = await SessionManager.listSessions(
      authResult.auth.user.id,
      authResult.auth.organizationId
    );
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("API error listing history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
