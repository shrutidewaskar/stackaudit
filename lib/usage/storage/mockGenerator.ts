import { UsageEvent } from "../types/types";

export class MockUsageGenerator {
  public static generateEvents(): UsageEvent[] {
    const orgId = "novatech-labs-uuid";
    const tools = [
      { provider: "cursor", tool: "cursor", domain: "cursor.sh" },
      { provider: "openai", tool: "chatgpt", domain: "chat.openai.com" },
      { provider: "anthropic", tool: "claude", domain: "claude.ai" },
      { provider: "github", tool: "copilot", domain: "github.com" },
      { provider: "perplexity", tool: "perplexity", domain: "perplexity.ai" }
    ];

    const employees = [
      { id: "emp-1", name: "John Doe", dept: "Engineering" },
      { id: "emp-2", name: "Jane Smith", dept: "Design" },
      { id: "emp-3", name: "Alex Jones", dept: "Marketing" },
      { id: "emp-4", name: "Emily Brown", dept: "Finance" },
      { id: "emp-5", name: "Michael Miller", dept: "Operations" }
    ];

    const events: UsageEvent[] = [];
    const now = new Date();

    // Generate 15 sequential events representing timeline logs
    for (let i = 0; i < 15; i++) {
      const toolInfo = tools[i % tools.length];
      const emp = employees[i % employees.length];
      
      const sessionStart = new Date(now.getTime() - (i * 45 + 30) * 60000);
      const sessionEnd = new Date(sessionStart.getTime() + 35 * 60000); // 35 minute session

      events.push({
        eventId: `ev-${1000 + i}`,
        organizationId: orgId,
        employeeId: emp.id,
        workspaceId: `ws-${toolInfo.provider}`,
        connectorId: `${toolInfo.provider}-connector`,
        provider: toolInfo.provider,
        tool: toolInfo.tool,
        source: "browser_extension",
        device: i % 2 === 0 ? "macOS" : "Windows",
        browser: i % 3 === 0 ? "Safari" : "Chrome",
        sessionStart: sessionStart.toISOString(),
        sessionEnd: sessionEnd.toISOString(),
        activeDuration: 31 * 60, // 31 minutes active
        idleDuration: 4 * 60, // 4 minutes idle
        tabVisibility: "visible",
        domain: toolInfo.domain,
        createdAt: new Date().toISOString(),
        metadata: {
          emailDomain: "novatech.com",
          activeSeconds: 31 * 60,
          idleSeconds: 4 * 60,
          tabState: "visible"
        }
      });
    }

    return events;
  }
}
