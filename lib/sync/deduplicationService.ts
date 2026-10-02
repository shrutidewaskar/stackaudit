import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

const processedEventIds = new Set<string>();

export class DeduplicationService {
  public static async isDuplicate(eventId: string): Promise<boolean> {
    if (processedEventIds.has(eventId)) {
      return true;
    }

    if (!isSupabaseConfigured) {
      processedEventIds.add(eventId);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("usage_events")
        .select("event_id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        processedEventIds.add(eventId);
        return true;
      }

      processedEventIds.add(eventId);
      return false;
    } catch {
      processedEventIds.add(eventId);
      return false;
    }
  }

  public static clearCache() {
    processedEventIds.clear();
  }
}
