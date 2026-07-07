import { IntentType, SuggestedAction, ConversationContext } from "./types";

export class PromptService {
  getSystemPrompt(intent: IntentType): string {
    return `You are StackAudit Intelligence, an expert software advisor helping teams audit, forecast, and optimize their AI tool ecosystems. Current intent: ${intent}.`;
  }

  getSuggestedActions(intent: IntentType, context: ConversationContext | null): SuggestedAction[] {
    const hasTools = context && context.tools && context.tools.length > 0;
    const topTool = hasTools ? context.tools![0].name : "ChatGPT";

    switch (intent) {
      case "Greeting":
      case "Help":
        return [
          { label: "Analyze my stack spend", prompt: "How can I reduce our AI budget?" },
          { label: "Compare Claude & ChatGPT", prompt: "Compare Claude and GPT licenses for a team." },
          { label: "Check optimization score", prompt: "What is my optimization score and how do I improve it?" }
        ];
      case "Optimization":
        return [
          { label: "Show duplicate seat details", prompt: `Explain license overlap in our stack.` },
          { label: "Get negotiation scripts", prompt: `Give me negotiation scripts to downgrade ${topTool}.` },
          { label: "Download action plan", prompt: "How do I implement these recommendations?" }
        ];
      case "Planning":
        return [
          { label: "Simulate hiring 10 devs", prompt: "Forecast our budget if we hire 10 new developers." },
          { label: "Adjust plan types", prompt: "What if we switch to team plans instead of individual seats?" },
          { label: "Forecast next 12 months", prompt: "Show our 12-month budget outlook." }
        ];
      case "Comparison":
        return [
          { label: "Compare team plans", prompt: "What are the price differences between Cursor Team and Copilot Business?" },
          { label: "Check API pricing", prompt: "Compare Gemini API and GPT-4o API costs." },
          { label: "Security & compliance differences", prompt: "Which models are best for SOC-2 compliance?" }
        ];
      default:
        return [
          { label: "Explain my recommendations", prompt: "Why are these changes recommended?" },
          { label: "Estimate annual savings", prompt: "Calculate my annual savings potential." },
          { label: "Help with vendor procurement", prompt: "How do I secure volume licensing discounts?" }
        ];
    }
  }
}

export const promptService = new PromptService();
