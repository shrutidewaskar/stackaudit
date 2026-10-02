import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const orgId = authResult.auth.organizationId;
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
