import { NextRequest, NextResponse } from "next/server";
import { MemoryRetrieval } from "@/lib/ai/memory/retrieval";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, orgId } = body;

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const results = await MemoryRetrieval.searchConversations({
      userId: userId || null,
      orgId: orgId || null,
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
