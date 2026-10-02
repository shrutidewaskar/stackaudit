import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

const mockProcessedEventIds = new Set<string>();

export class DeduplicationService {
  /**
   * Checks if an event ID has already been recorded.
   * In DEV_MOCK_MODE / test mode, checks the in-memory set.
   * In production mode, queries the durable `usage_events` table in PostgreSQL.
   */
  public static async isDuplicate(eventId: string): Promise<boolean> {
    if (isDevMockMode()) {
      if (mockProcessedEventIds.has(eventId)) {
        return true;
      }
      mockProcessedEventIds.add(eventId);
      return false;
    }

    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from("usage_events")
      .select("event_id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database Error [usage_events.checkDuplicate]: ${error.message}`);
    }

    return Boolean(data);
  }

  public static clearCache(): void {
    mockProcessedEventIds.clear();
  }
}

