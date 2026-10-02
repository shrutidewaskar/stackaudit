import { memoryService } from "./memoryService";
import { ChatSession, ChatMessage, ConversationMemory } from "./types";

export interface SearchResult {
  session: ChatSession;
  matchedMessages: ChatMessage[];
  memory: ConversationMemory | null;
}

export class MemoryRetrieval {
  /**
   * Search all conversations in the organization or user scope matching a query string.
   */
  public static async searchConversations(params: {
    userId: string | null;
    orgId: string | null;
    query: string;
  }): Promise<SearchResult[]> {
    const sessions = await memoryService.listSessions(params.userId, params.orgId);
    const lowercaseQuery = params.query.toLowerCase();
    const results: SearchResult[] = [];

    for (const session of sessions) {
      const messages = await memoryService.getMessages(session.id);
      const memory = await memoryService.getConversationMemory(session.id);

      // Check if session title matches
      let matched = session.title.toLowerCase().includes(lowercaseQuery);

      // Check if memory summary or entities/topics match
      if (memory) {
        if (
          memory.summary.toLowerCase().includes(lowercaseQuery) ||
          memory.entities.some((e) => e.toLowerCase().includes(lowercaseQuery)) ||
          memory.topics.some((t) => t.toLowerCase().includes(lowercaseQuery)) ||
          memory.important_decisions.some((d) => d.toLowerCase().includes(lowercaseQuery))
        ) {
          matched = true;
        }
      }

      // Check messages content
      const matchedMessages = messages.filter((m) =>
        m.content.toLowerCase().includes(lowercaseQuery)
      );

      if (matched || matchedMessages.length > 0) {
        results.push({
          session,
          matchedMessages,
          memory
        });
      }
    }

    return results;
  }

  /**
   * Explains recommendations or historical records by fetching matching previous reports/messages.
   */
  public static async retrieveRelevantFacts(params: {
    userId: string | null;
    orgId: string | null;
    query: string;
  }): Promise<{
    historicalAnswers: string[];
    relevantDecisions: string[];
    involvedTools: string[];
  }> {
    const searchResults = await this.searchConversations(params);
    const historicalAnswers: string[] = [];
    const relevantDecisions: string[] = [];
    const involvedToolsSet = new Set<string>();

    for (const res of searchResults) {
      if (res.memory) {
        res.memory.important_decisions.forEach((dec) => relevantDecisions.push(dec));
        res.memory.entities.forEach((ent) => involvedToolsSet.add(ent));
      }
      // Pull assistant answers matching context
      const assistantReplies = res.matchedMessages.filter((m) => m.role === "assistant");
      assistantReplies.forEach((r) => {
        historicalAnswers.push(`[Session: ${res.session.title}] AI Reply: ${r.content}`);
      });
    }

    return {
      historicalAnswers: historicalAnswers.slice(0, 5),
      relevantDecisions: relevantDecisions.slice(0, 10),
      involvedTools: Array.from(involvedToolsSet)
    };
  }
}
