import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/ai/memory/sessionManager";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const orgId = searchParams.get("orgId");

    const sessions = await SessionManager.listSessions(userId, orgId);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("API error listing history:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
