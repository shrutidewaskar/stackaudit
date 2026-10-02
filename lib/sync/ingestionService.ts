import { UsageEvent } from "../usage/types/types";
import { IngestionResult } from "./types";
import { PrivacyService } from "./privacyService";
import { NormalizationService } from "./normalizationService";
import { DeduplicationService } from "./deduplicationService";
import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// Fallback in-memory database storage for persistent events
export const mockUsageEventsDB: UsageEvent[] = [];

export class IngestionService {
  public static async ingestBatch(orgId: string, events: UsageEvent[]): Promise<IngestionResult> {
    const result: IngestionResult = {
      accepted: 0,
      rejected: 0,
      duplicates: 0,
      errors: []
    };

    const validEventsToSave: UsageEvent[] = [];

    for (const ev of events) {
      try {
        // 1. Organization Isolation
        if (ev.organizationId !== orgId) {
          result.rejected++;
          result.errors.push(`Event ${ev.eventId} rejected: Organization boundary mismatch`);
          continue;
        }

        // 2. Schema / Required Field validation
        if (!ev.eventId || !ev.employeeId || !ev.provider || !ev.tool) {
          result.rejected++;
          result.errors.push(`Event ${ev.eventId} rejected: Missing required fields`);
          continue;
        }

        // 3. Durations validation
        if (ev.activeDuration < 0 || ev.idleDuration < 0) {
          result.rejected++;
          result.errors.push(`Event ${ev.eventId} rejected: Negative duration values`);
          continue;
        }

        // 4. Timestamp consistency validation
        const start = Date.parse(ev.sessionStart);
        const end = Date.parse(ev.sessionEnd);
        if (isNaN(start) || isNaN(end) || start > end) {
          result.rejected++;
          result.errors.push(`Event ${ev.eventId} rejected: Corrupt timestamp sequence`);
          continue;
        }

        // 5. Server-side Privacy Enforcement
        const { isSafe, sanitizedEvent } = PrivacyService.enforce(ev);
        if (!isSafe) {
          result.rejected++;
          result.errors.push(`Event ${ev.eventId} rejected: Sensitive telemetry data detected`);
          continue;
        }

        // 6. Normalization mapping
        const normalized: UsageEvent = {
          ...sanitizedEvent,
          provider: NormalizationService.normalizeProvider(sanitizedEvent.provider),
          tool: NormalizationService.normalizeTool(sanitizedEvent.tool),
          domain: NormalizationService.normalizeDomain(sanitizedEvent.domain)
        };

        // 7. Deduplication Check
        const isDuplicate = await DeduplicationService.isDuplicate(normalized.eventId);
        if (isDuplicate) {
          result.duplicates++;
          continue;
        }

        validEventsToSave.push(normalized);
        result.accepted++;
      } catch (err) {
        result.rejected++;
        result.errors.push(`Event ${ev.eventId} failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Persist batch to DB
    if (validEventsToSave.length > 0) {
      if (!isSupabaseConfigured) {
        mockUsageEventsDB.push(...validEventsToSave);
      } else {
        try {
          const dbRows = validEventsToSave.map((e) => ({
            event_id: e.eventId,
            organization_id: e.organizationId,
            employee_id: e.employeeId,
            workspace_id: e.workspaceId,
            connector_id: e.connectorId,
            provider: e.provider,
            tool: e.tool,
            source: e.source,
            domain: e.domain,
            session_start: e.sessionStart,
            session_end: e.sessionEnd,
            active_duration: e.activeDuration,
            idle_duration: e.idleDuration,
            tab_visibility: e.tabVisibility,
            device: e.device,
            browser: e.browser,
            metadata: e.metadata
          }));
          const { error } = await supabase.from("usage_events").insert(dbRows);
          if (error) throw error;
        } catch (err) {
          // Fallback on error
          mockUsageEventsDB.push(...validEventsToSave);
          result.errors.push(`Database persistence error, saved to fallback cache: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
    }

    return result;
  }
}
