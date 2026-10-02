import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    // Mock history trends snapshots
    const snapAugust = GovernanceEngine.generateSnapshot(orgId);
    const snapJuly = {
      ...snapAugust,
      id: `snap-${orgId}-2026-07-08`,
      snapshotDate: "2026-07-08",
      overallScore: 71,
      visibilityScore: 80,
      utilizationScore: 65,
      adoptionScore: 75,
      redundancyScore: 60,
      dataCompletenessScore: 85,
      findingCount: 5,
      criticalCount: 0,
      highCount: 2,
      mediumCount: 3
    };

    return NextResponse.json({
      history: [snapJuly, snapAugust],
      difference: {
        overall: snapAugust.overallScore - snapJuly.overallScore,
        visibility: snapAugust.visibilityScore - snapJuly.visibilityScore,
        utilization: snapAugust.utilizationScore - snapJuly.utilizationScore,
        adoption: snapAugust.adoptionScore - snapJuly.adoptionScore,
        redundancy: snapAugust.redundancyScore - snapJuly.redundancyScore,
        dataCompleteness: snapAugust.dataCompletenessScore - snapJuly.dataCompletenessScore
      }
    });
  } catch (error) {
    console.error("Governance Trends API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
