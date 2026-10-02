import { ChatMessage, ConversationMemory } from "./types";

export class SummaryEngine {
  public static async generateSummary(
    sessionId: string,
    existingMemory: ConversationMemory | null,
    messages: ChatMessage[]
  ): Promise<ConversationMemory> {
    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");

    // 1. Extract entities (tool names, roles, etc.)
    const entitiesSet = new Set<string>(existingMemory?.entities || []);
    const toolKeywords = [
      "cursor",
      "copilot",
      "claude",
      "chatgpt",
      "perplexity",
      "midjourney",
      "notion",
      "openai",
      "anthropic",
      "gemini"
    ];

    // Scan messages for tool entities
    for (const msg of messages) {
      const lowerContent = msg.content.toLowerCase();
      for (const keyword of toolKeywords) {
        if (lowerContent.includes(keyword)) {
          // Capitalize first letter
          entitiesSet.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      }
      if (lowerContent.includes("engineering")) entitiesSet.add("Engineering");
      if (lowerContent.includes("finance")) entitiesSet.add("Finance");
      if (lowerContent.includes("procurement")) entitiesSet.add("Procurement");
    }

    // 2. Extract topics
    const topicsSet = new Set<string>(existingMemory?.topics || []);
    const topicKeywords: Record<string, string[]> = {
      "License Optimization": ["license", "seat", "reduce", "downgrade", "optimize"],
      "Budget Allocation": ["budget", "pricing", "cost", "save", "spend"],
      "Contract Renewal": ["renew", "renewal", "enterprise", "agreement", "contract"],
      "Tool Consolidation": ["consolidation", "overlapping", "redundancy", "duplicate"],
      "Security & Governance": ["security", "governance", "compliance", "policy", "privacy"]
    };

    for (const msg of messages) {
      const lowerContent = msg.content.toLowerCase();
      for (const [topic, words] of Object.entries(topicKeywords)) {
        if (words.some((word) => lowerContent.includes(word))) {
          topicsSet.add(topic);
        }
      }
    }

    // 3. Extract important decisions
    const decisionsSet = new Set<string>(existingMemory?.important_decisions || []);
    const decisionTriggers = ["approve", "decide", "confirm", "agree", "accept", "reject", "cancel"];
    for (const msg of userMessages) {
      const lowerContent = msg.content.toLowerCase();
      if (decisionTriggers.some((trigger) => lowerContent.includes(trigger))) {
        // Formulate a simple decision statement
        const snippet = msg.content.length > 60 ? msg.content.substring(0, 60) + "..." : msg.content;
        decisionsSet.add(`User stated: "${snippet}"`);
      }
    }

    // 4. Formulate running summary
    let summary = existingMemory?.summary || "";
    if (messages.length > 0) {
      const toolList = Array.from(entitiesSet).join(", ") || "various AI tools";
      const topicList = Array.from(topicsSet).join(", ") || "general queries";
      summary = `Conversation discussing ${topicList} regarding ${toolList}. Checked total of ${messages.length} messages.`;
    } else {
      summary = "New session with no messages yet.";
    }

    return {
      id: existingMemory?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36)),
      session_id: sessionId,
      summary,
      entities: Array.from(entitiesSet),
      topics: Array.from(topicsSet),
      important_decisions: Array.from(decisionsSet),
      last_updated: new Date().toISOString()
    };
  }
}
