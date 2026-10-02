import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const findings = GovernanceEngine.generateFindings(authResult.auth.organizationId);
    return NextResponse.json(findings);
  } catch (error) {
    console.error("Governance Findings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
