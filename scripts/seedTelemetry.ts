import { IngestionService } from "../lib/sync/ingestionService";
import { AggregationService } from "../lib/sync/aggregationService";
import { UsageEvent } from "../lib/usage/types/types";

async function seed() {
  console.log("=== Seeding 30-Day Chronological Telemetry Dataset ===");
  const orgId = "novatech-labs-uuid";
  const tools = [
    { provider: "cursor", tool: "cursor", domain: "cursor.sh" },
    { provider: "openai", tool: "chatgpt", domain: "chat.openai.com" },
    { provider: "anthropic", tool: "claude", domain: "claude.ai" }
  ];

  const deptIds = ["dept-eng", "dept-des", "dept-mkt", "dept-fin", "dept-ops"];
  
  const events: UsageEvent[] = [];
  const now = new Date();

  // Seed events for the past 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().substring(0, 10);

    // Loop through 120 employees (emp-1 to emp-120)
    for (let i = 1; i <= 120; i++) {
      // 1. Heavy users: emp-1 to emp-10 (log events daily)
      // 2. Occasional users: emp-11 to emp-80 (log events every 3 days)
      // 3. Inactive users: emp-81 to emp-120 (0 events - dormant candidates)
      
      const isHeavy = i <= 10;
      const isOccasional = i > 10 && i <= 80 && (day + i) % 3 === 0;
      
      if (isHeavy || isOccasional) {
        const toolInfo = tools[i % tools.length];
        const deptId = deptIds[i % deptIds.length];

        events.push({
          eventId: `seed-ev-${day}-${i}`,
          organizationId: orgId,
          employeeId: `emp-${i}`,
          workspaceId: `ws-${toolInfo.provider}`,
          connectorId: `${toolInfo.provider}-connector`,
          provider: toolInfo.provider,
          tool: toolInfo.tool,
          source: "browser_extension",
          device: i % 2 === 0 ? "macOS" : "Windows",
          browser: i % 3 === 0 ? "Safari" : "Chrome",
          sessionStart: `${dateStr}T09:00:00Z`,
          sessionEnd: `${dateStr}T09:35:00Z`,
          activeDuration: isHeavy ? 30 * 60 : 15 * 60, // heavy users use it longer
          idleDuration: isHeavy ? 5 * 60 : 20 * 60,
          tabVisibility: "visible",
          domain: toolInfo.domain,
          createdAt: new Date().toISOString(),
          metadata: {
            emailDomain: "novatech.com",
            activeSeconds: isHeavy ? 30 * 60 : 15 * 60,
            idleSeconds: isHeavy ? 5 * 60 : 20 * 60,
            tabState: "visible"
          }
        });
      }
    }
  }

  console.log(`Generated ${events.length} seed telemetry events.`);

  // Ingest batch
  const stats = await IngestionService.ingestBatch(orgId, events);
  console.log(`Ingested: ${stats.accepted} accepted, ${stats.rejected} rejected, ${stats.duplicates} duplicates.`);

  // Aggregate daily
  const uniqueDates = Array.from(new Set(events.map((e) => e.sessionStart.substring(0, 10))));
  for (const dateStr of uniqueDates) {
    await AggregationService.aggregateDaily(orgId, dateStr);
  }
  console.log(`Aggregated daily data for ${uniqueDates.length} days.`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
});
export {};
