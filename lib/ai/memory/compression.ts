import { ChatMessage, ConversationMemory } from "./types";
import { SummaryEngine } from "./summaryEngine";

export interface CompressedContext {
  summary: string;
  entities: string[];
  topics: string[];
  importantDecisions: string[];
  activeMessages: ChatMessage[];
  wasCompressed: boolean;
}

export class ContextCompression {
  /**
   * Compresses the message history. If message count exceeds threshold,
   * compresses older messages into summary entities/topics/facts and retains
   * only the most recent N messages as active message history.
   */
  public static async compressHistory(
    sessionId: string,
    existingMemory: ConversationMemory | null,
    messages: ChatMessage[],
    recentThresholdCount: number = 4
  ): Promise<CompressedContext> {
    if (messages.length <= recentThresholdCount) {
      // No compression needed
      const memory = await SummaryEngine.generateSummary(sessionId, existingMemory, messages);
      return {
        summary: memory.summary,
        entities: memory.entities,
        topics: memory.topics,
        importantDecisions: memory.important_decisions,
        activeMessages: messages,
        wasCompressed: false
      };
    }

    // Identify older messages to compress
    const olderMessages = messages.slice(0, messages.length - recentThresholdCount);
    const activeMessages = messages.slice(messages.length - recentThresholdCount);

    // Compute summary of the older subset
    const compressedOlderMemory = await SummaryEngine.generateSummary(sessionId, existingMemory, olderMessages);

    // Compute overall memory summary of all messages to update the running memory
    const fullMemory = await SummaryEngine.generateSummary(sessionId, existingMemory, messages);

    return {
      summary: fullMemory.summary,
      entities: fullMemory.entities,
      topics: fullMemory.topics,
      importantDecisions: fullMemory.important_decisions,
      activeMessages: activeMessages,
      wasCompressed: true
    };
  }
}
