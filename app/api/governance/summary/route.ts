import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

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
