import { NextRequest, NextResponse } from "next/server";
import { memoryService } from "@/lib/ai/memory/memoryService";
import { ContextCompression } from "@/lib/ai/memory/compression";
import { AIContextBuilder } from "@/lib/ai/context/contextBuilder";
import { providerRegistry } from "@/lib/ai/providers/registry";
import { ChatMessage } from "@/lib/ai/memory/types";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { sessionId, content } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ error: "Missing sessionId or content" }, { status: 400 });
    }

    // 1. Fetch current session and verify tenant ownership
    const session = await memoryService.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.organization_id && session.organization_id !== authResult.auth.organizationId) {
      return NextResponse.json({ error: "Session not found in your organization" }, { status: 404 });
    }

    // 2. Save user message (Level 1 memory)
    const userMsg: ChatMessage = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      session_id: sessionId,
      role: "user",
      content,
      metadata: {},
      token_count: Math.ceil(content.length / 4),
      created_at: new Date().toISOString()
    };
    await memoryService.saveMessage(userMsg);

    // 3. Fetch all messages in the session
    const allMessages = await memoryService.getMessages(sessionId);

    // 4. Run automatic compression & summarization (Level 2 memory update)
    const existingMemory = await memoryService.getConversationMemory(sessionId);
    const compressedContext = await ContextCompression.compressHistory(
      sessionId,
      existingMemory,
      allMessages,
      4
    );

    // Save running conversation memory summary
    const updatedMemory = await memoryService.saveConversationMemory({
      id: existingMemory?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36)),
      session_id: sessionId,
      summary: compressedContext.summary,
      entities: compressedContext.entities,
      topics: compressedContext.topics,
      important_decisions: compressedContext.importantDecisions,
      last_updated: new Date().toISOString()
    });

    // 5. Build secure organization grounding context using AIContextBuilder with authenticated identity
    const resolvedOrgId = authResult.auth.organizationId;
    const resolvedUserId = authResult.auth.user.id;
    const aiContext = await AIContextBuilder.buildContext(resolvedOrgId, resolvedUserId, content);

    // 6. Invoke dynamic provider (MockProvider or GeminiProvider)
    const activeProvider = providerRegistry.getProvider();
    const aiResponse = await activeProvider.generate(aiContext, content);

    // 7. Save assistant reply (Level 1 memory)
    const assistantMsg: ChatMessage = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36),
      session_id: sessionId,
      role: "assistant",
      content: aiResponse.answer,
      metadata: {
        citations: aiResponse.citations,
        confidence: aiResponse.confidence,
        recommendedActions: aiResponse.recommendedActions,
        followUpQuestions: aiResponse.followUpQuestions,
        relatedFindings: aiResponse.relatedFindings,
        relatedReports: aiResponse.relatedReports
      },
      token_count: Math.ceil(aiResponse.answer.length / 4),
      created_at: new Date().toISOString()
    };
    await memoryService.saveMessage(assistantMsg);

    // Update last_message_at on the session
    session.last_message_at = new Date().toISOString();
    await memoryService.saveSession(session);

    return NextResponse.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      memorySummary: updatedMemory
    });
  } catch (error) {
    console.error("API error processing message:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
