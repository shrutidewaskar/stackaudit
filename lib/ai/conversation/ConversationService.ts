import { memoryService } from "./MemoryService";
import { intentService } from "./IntentService";
import { promptService } from "./PromptService";
import { contextService } from "./ContextService";
import { ChatMessage, ChatSession, ConversationContext, IntentType } from "./types";

export class ConversationService {
  async getOrInitializeSession(userId: string | null, auditId: string | null): Promise<{ session: ChatSession; messages: ChatMessage[]; context: ConversationContext | null }> {
    // 1. Find existing session for user/audit
    const sessions = await memoryService.getSessionsByUser(userId);
    let session = sessions.find((s) => s.audit_id === auditId);

    if (!session) {
      // Create new session
      session = await memoryService.createSession(userId, auditId);

      // Save initial assistant greeting message
      const greeting = "Hi Shruti 👋\n\nI've analyzed your AI ecosystem. I noticed three things worth discussing:\n\n1. **High ChatGPT Cost**: ChatGPT Plus licenses represent a significant portion of your budget.\n2. **License Redundancy**: You have overlapping developer licenses between ChatGPT and Claude Team.\n3. **Hiring growth**: Future hiring plans will scale these duplicate expenses exponentially.\n\nHow would you like to start?";
      
      await memoryService.saveMessage(session.id, "assistant", greeting);

      // Initialize context from audit if present
      if (auditId) {
        const auditCtx = await contextService.buildContextFromAudit(auditId);
        auditCtx.session_id = session.id;
        await memoryService.saveContext(auditCtx);
      }
    }

    const messages = await memoryService.getMessages(session.id);
    const context = await memoryService.getContext(session.id);

    return { session, messages, context };
  }

  async processUserMessage(sessionId: string, content: string): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    // 1. Save user message
    const userMessage = await memoryService.saveMessage(sessionId, "user", content);

    // 2. Classify intent
    const intent = intentService.detectIntent(content);

    // 3. Update session intent
    const session = await memoryService.getSession(sessionId);
    if (session) {
      session.current_intent = intent;
    }

    // 4. Retrieve context
    const context = await memoryService.getContext(sessionId);

    // 5. Generate realistic mock response based on intent and context
    const assistantContent = this.generateResponse(intent, content, context);

    // 6. Save assistant message
    const assistantMessage = await memoryService.saveMessage(sessionId, "assistant", assistantContent, { intent });

    return { userMessage, assistantMessage };
  }

  private generateResponse(intent: IntentType, userMsg: string, context: ConversationContext | null): string {
    const hasTools = context && context.tools && context.tools.length > 0;
    const score = context?.optimization_score || 75;
    const budget = context?.budget || 1200;

    switch (intent) {
      case "Greeting":
        return "Hello! I am StackAudit Intelligence. I am here to help you audit your active subscriptions, forecast hiring plans, and suggest optimizations. What aspect of your AI stack would you like to discuss today?";
      case "Help":
        return "I can assist you with:\n\n* **Cost Cut Analysis**: Pinpoint license overlaps and negotiate seats.\n* **Simulation**: Forecast how hiring new engineers will impact your software budget.\n* **Tool Comparisons**: Deep dive into capabilities between Claude, Copilot, Cursor, etc.";
      case "Optimization":
        if (hasTools) {
          const savings = Math.round(budget * 0.3);
          return `Based on your audit data, we identified redundant seats in your stack. You can immediately save **$${savings}/mo** by:\n\n1. Downgrading developer licenses that overlap between Claude and Copilot.\n2. Archiving inactive user accounts.\n\nWould you like me to prepare a step-by-step seat downscale guide?`;
        }
        return "I can help you optimize your tools. Please run an audit or input your active tools first so I can inspect for duplicate subscriptions.";
      case "Planning":
        const match = userMsg.match(/\d+/);
        const count = match ? parseInt(match[0]) : 10;
        const incrementalCost = count * 20;
        return `Simulating hiring plan for **${count} new developers**:\n\n* **Current Monthly Spend**: $${budget}/mo\n* **Estimated Additional Cost**: +$${incrementalCost}/mo\n* **Projected Monthly Budget**: $${budget + incrementalCost}/mo\n\nIf we keep the current redundant tools structure, we will waste an extra **$${Math.round(incrementalCost * 0.35)}/mo** on duplicate seats. I recommend standardizing developer toolsets before onboarding.`;
      case "Comparison":
        return `Here is a capability comparison table of developer environments:\n\n| Feature | Cursor Pro | GitHub Copilot | Claude Pro |\n| :--- | :--- | :--- | :--- |\n| **Cost (Seat/mo)** | $20 | $19 | $20 |\n| **Model support** | Claude 3.5 Sonnet / GPT-4o | Custom Copilot Engine | Claude 3.5 Sonnet |\n| **Codebase context** | Full index indexer | Vector search workspace | Project Files list |\n| **Premium features** | Multi-file edits, Composer | inline chat | Artifacts pages |\n\nCursor is usually best suited for engineering teams requiring full codebase editing, while Copilot fits smaller teams looking for simple autocomplete.`;
      case "Forecasting":
        const annualSavings = Math.round(budget * 0.3 * 12);
        return `Our financial forecast shows:\n\n* **Annualized Current Runrate**: $${budget * 12}/yr\n* **Optimized Annual Runrate**: $${(budget - Math.round(budget * 0.3)) * 12}/yr\n* **Total Net Savings**: **$${annualSavings}/yr**\n\nThis projection assumes you downscale duplicate seats by the end of this month. We can run more simulations if you plan to change tool allocations.`;
      case "Procurement":
        return `For AI tools volume negotiation, follow these steps:\n\n1. **Consolidate accounts**: Pool single individual licenses into a unified team organization.\n2. **Request annual billing**: Most vendors (Anthropic, OpenAI) offer a **15% to 20% discount** when migrating to yearly agreements.\n3. **Leverage seat minimums**: If you have 50+ seats, request enterprise pricing for custom SLA terms and SSO integration.\n\nWould you like to draft a request for enterprise discounts?`;
      default:
        return "I've logged your request. Our deterministic calculations show significant savings opportunities by consolidating licenses. Let me know if you want to compare Claude and GPT, simulate hiring, or downscale seats.";
    }
  }
}

export const conversationService = new ConversationService();
