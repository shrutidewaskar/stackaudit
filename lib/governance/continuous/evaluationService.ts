import { GovernanceEngine } from "../engine";
import { GovernanceSnapshot } from "../types";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export const localSnapshotsCache: GovernanceSnapshot[] = [];

export class DailyGovernanceJob {
  public static async execute(orgId: string): Promise<{ success: boolean; snapshot: GovernanceSnapshot }> {
    console.log(`[DailyGovernanceJob] Executing evaluation pipeline for organization: ${orgId}...`);
    
    // 1. Generate snapshot via GovernanceEngine
    const snapshot = GovernanceEngine.generateSnapshot(orgId);

    // 2. Persist to database (upserting to prevent duplicates for the same organization and date)
    if (isDevMockMode()) {
      const idx = localSnapshotsCache.findIndex(
        (s) => s.organizationId === orgId && s.snapshotDate === snapshot.snapshotDate
      );
      if (idx >= 0) {
        localSnapshotsCache[idx] = snapshot;
      } else {
        localSnapshotsCache.push(snapshot);
      }
    } else {
      assertSupabaseConfigured();
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

      if (error) {
        throw new Error(`Database Error [governance_snapshots.upsert]: ${error.message}`);
      }
    }

    console.log(`[DailyGovernanceJob] Success. Score: ${snapshot.overallScore}, Findings: ${snapshot.findingCount}`);
    return { success: true, snapshot };
  }
}
