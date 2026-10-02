import { NextRequest, NextResponse } from "next/server";
import { GovernanceEngine } from "@/lib/governance/engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    const breakdown = GovernanceEngine.calculateScore(orgId);
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Governance Score API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
