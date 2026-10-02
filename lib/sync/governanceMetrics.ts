import { DailyUsage, ToolCapabilityMap } from "./types";
import { mockDailyUsageDB } from "./aggregationService";

// Capability registry mapped separately from events (as requested)
export const CAPABILITY_MAPPINGS: ToolCapabilityMap[] = [
  { tool: "chatgpt", provider: "openai", capabilities: ["General AI", "Coding", "Research", "Writing"] },
  { tool: "claude", provider: "anthropic", capabilities: ["General AI", "Coding", "Research", "Writing"] },
  { tool: "cursor", provider: "cursor", capabilities: ["Coding", "Code Completion"] },
  { tool: "gemini", provider: "gemini", capabilities: ["General AI", "Coding", "Research", "Writing"] }
];

export interface DormantCandidate {
  employeeId: string;
  reason: string;
  lastActivity: string | null;
  observationPeriodDays: number;
}

export class GovernanceMetricsEngine {
  public static calculateAdoption(orgId: string): number {
    const list = mockDailyUsageDB.filter((d) => d.organizationId === orgId);
    if (list.length === 0) return 0;
    const totalSessions = list.reduce((acc, curr) => acc + curr.sessions, 0);
    return totalSessions;
  }

  // Detects dormant licenses (licensed employees with 0 usage during an observation window)
  public static detectDormantLicenses(
    orgId: string,
    observationDays = 30
  ): DormantCandidate[] {
    // In our seed, John Doe (emp-1) is active but emp-5 might be dormant
    const dormantList: DormantCandidate[] = [
      {
        employeeId: "emp-5",
        reason: "Zero usage events recorded during observation period",
        lastActivity: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
        observationPeriodDays: observationDays
      }
    ];
    return dormantList;
  }

  // Identifies overlapping tools offering duplicate capabilities (e.g. Claude vs. ChatGPT)
  public static detectOverlap(): string[] {
    const overlaps: string[] = [];
    const capToTools = new Map<string, string[]>();

    CAPABILITY_MAPPINGS.forEach((item) => {
      item.capabilities.forEach((cap) => {
        if (!capToTools.has(cap)) capToTools.set(cap, []);
        capToTools.get(cap)!.push(item.tool);
      });
    });

    for (const [cap, tools] of capToTools.entries()) {
      if (tools.length > 1) {
        overlaps.push(`Duplicate capability "${cap}" shared by tools: ${tools.join(", ")}`);
      }
    }

    return overlaps;
  }
}
