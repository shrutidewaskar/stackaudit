import { GovernanceEngine } from "../engine";
import { GovernanceSnapshot } from "../types";
import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export const localSnapshotsCache: GovernanceSnapshot[] = [];

export class DailyGovernanceJob {
  public static async execute(orgId: string): Promise<{ success: boolean; snapshot: GovernanceSnapshot }> {
    console.log(`[DailyGovernanceJob] Executing evaluation pipeline for organization: ${orgId}...`);
    
    // 1. Generate snapshot via GovernanceEngine
    const snapshot = GovernanceEngine.generateSnapshot(orgId);

    // 2. Persist to database (upserting to prevent duplicates for the same organization and date)
    if (!isSupabaseConfigured) {
      const idx = localSnapshotsCache.findIndex(
        (s) => s.organizationId === orgId && s.snapshotDate === snapshot.snapshotDate
      );
      if (idx >= 0) {
        localSnapshotsCache[idx] = snapshot;
      } else {
        localSnapshotsCache.push(snapshot);
      }
    } else {
      try {
        const { error } = await supabase.from("governance_snapshots").upsert({
          organization_id: snapshot.organizationId,
          snapshot_date: snapshot.snapshotDate,
          overall_score: snapshot.overallScore,
          visibility_score: snapshot.visibilityScore,
          utilization_score: snapshot.utilizationScore,
          adoption_score: snapshot.adoptionScore,
          redundancy_score: snapshot.redundancyScore,
          data_completeness_score: snapshot.dataCompletenessScore,
          finding_count: snapshot.findingCount,
          critical_count: snapshot.criticalCount,
          high_count: snapshot.highCount,
          medium_count: snapshot.mediumCount
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to persist snapshot in Supabase:", err);
        // Fallback
        localSnapshotsCache.push(snapshot);
      }
    }

    console.log(`[DailyGovernanceJob] Success. Score: ${snapshot.overallScore}, Findings: ${snapshot.findingCount}`);
    return { success: true, snapshot };
  }
}
