import { BaseAIProvider } from "./base";
import { AIResponse, AIStreamChunk } from "../types";

export class MockProvider extends BaseAIProvider {
  name(): string {
    return "MockProvider";
  }

  async health(): Promise<boolean> {
    return true;
  }

  async generate(prompt: string, schema?: string, options?: any): Promise<AIResponse> {
    let responseText = "";

    switch (schema) {
      case "AuditSummary":
        responseText = JSON.stringify({
          summary: "Deterministic mock summary: StackAudit identified redundancy in AI chatbot subscriptions.",
          score: 85,
          savingsMonthly: 1825,
          savingsAnnual: 21900
        });
        break;
      case "ExecutiveReport":
        responseText = JSON.stringify({
          title: "AI Stack Procurement Report",
          grade: "A",
          recommendationsCount: 5,
          topOpportunity: "Consolidate duplicate general chatbot licenses"
        });
        break;
      case "OptimizationAdvice":
        responseText = JSON.stringify({
          recommendations: [
            { tool: "ChatGPT Plus", action: "Downgrade", saving: 20, reason: "Redundant with Claude Team licenses." }
          ]
        });
        break;
      case "MarketplaceAnswer":
        responseText = JSON.stringify({
          answer: "Mock answer: We recommend Cursor Pro for engineering teams of 10+ devs.",
          comparisons: ["Cursor vs Copilot", "Claude vs ChatGPT"]
        });
        break;
      case "ChatResponse":
        responseText = JSON.stringify({
          reply: "Hello! This is a mock AI response from the StackAudit platform.",
          suggestedFollowUps: ["How can I save on Cursor?", "Analyze my stack"]
        });
        break;
      default:
        responseText = "This is a generic mock response from StackAudit Sprint 0 Foundation.";
    }

    return { text: responseText };
  }

  async stream(prompt: string, options?: any): Promise<ReadableStream<AIStreamChunk>> {
    const mockChunks = [
      { text: "Mock ", done: false },
      { text: "streamed ", done: false },
      { text: "response ", done: false },
      { text: "from ", done: false },
      { text: "StackAudit.", done: true }
    ];

    return new ReadableStream<AIStreamChunk>({
      async start(controller) {
        for (const chunk of mockChunks) {
          controller.enqueue(chunk);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        controller.close();
      }
    });
  }
}
