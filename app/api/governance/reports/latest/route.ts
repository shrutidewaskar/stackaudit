import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";
    const type = searchParams.get("type"); // WEEKLY_DIGEST or MONTHLY_EXECUTIVE

    const orgReports = localReportsCache.filter(
      (r) => r.organizationId === orgId && (!type || r.reportType === type)
    );

    if (orgReports.length === 0) {
      return NextResponse.json({ error: "No reports found" }, { status: 404 });
    }

    // Sort by generation date descending
    orgReports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return NextResponse.json(orgReports[0]);
  } catch (error) {
    console.error("Latest Report API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
