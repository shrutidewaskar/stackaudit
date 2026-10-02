import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    const findings = GovernanceEngine.generateFindings(orgId);
    return NextResponse.json(findings);
  } catch (error) {
    console.error("Governance Findings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
