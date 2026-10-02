import { NextRequest, NextResponse } from "next/server";
import { MemoryRetrieval } from "@/lib/ai/memory/retrieval";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const results = await MemoryRetrieval.searchConversations({
      userId: authResult.auth.user.id,
      orgId: authResult.auth.organizationId,
      query
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("API error searching chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
