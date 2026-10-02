import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const orgId = authResult.auth.organizationId;
    const score = GovernanceEngine.calculateScore(orgId);
    const findings = GovernanceEngine.generateFindings(orgId);

    return NextResponse.json({
      overallScore: score.overallScore,
      totalFindings: findings.length,
      criticalFindings: findings.filter((f) => f.severity === "CRITICAL").length,
      highFindings: findings.filter((f) => f.severity === "HIGH").length,
      mediumFindings: findings.filter((f) => f.severity === "MEDIUM").length,
      lowFindings: findings.filter((f) => f.severity === "LOW").length
    });
  } catch (error) {
    console.error("Governance Summary API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
