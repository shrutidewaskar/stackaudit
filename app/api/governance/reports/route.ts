import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";
import { GovernanceScheduler } from "@/lib/governance/continuous/scheduler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId") || "novatech-labs-uuid";

    // Returns reports filtered by organization
    const list = localReportsCache.filter((r) => r.organizationId === orgId);
    return NextResponse.json(list);
  } catch (error) {
    console.error("Governance Reports API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, reportType, periodStart, periodEnd } = body;

    if (!organizationId || !reportType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;
    const start = periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const end = periodEnd || new Date().toISOString().substring(0, 10);

    switch (reportType) {
      case "DAILY_SNAPSHOT":
        result = await GovernanceScheduler.triggerDaily(organizationId);
        break;
      case "WEEKLY_DIGEST":
        result = await GovernanceScheduler.triggerWeekly(organizationId, start, end);
        break;
      case "MONTHLY_EXECUTIVE":
        result = await GovernanceScheduler.triggerMonthly(organizationId, start, end);
        break;
      case "QUARTERLY_REVIEW":
        result = await GovernanceScheduler.triggerQuarterly(organizationId, start, end);
        break;
      default:
        return NextResponse.json({ error: "Unsupported report type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Manual Report trigger API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
