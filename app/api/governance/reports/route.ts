import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";
import { GovernanceScheduler } from "@/lib/governance/continuous/scheduler";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const orgId = authResult.auth.organizationId;

    if (isDevMockMode()) {
      const list = localReportsCache.filter((r) => r.organizationId === orgId);
      return NextResponse.json(list);
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("governance_reports")
      .select("*")
      .eq("organization_id", orgId)
      .order("generated_at", { ascending: false });

    if (error) {
      throw new Error(`Database Error [governance_reports.select]: ${error.message}`);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Governance Reports API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request, null, "manager");
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { reportType, periodStart, periodEnd } = body;

    if (!reportType) {
      return NextResponse.json({ error: "Missing reportType field" }, { status: 400 });
    }

    const organizationId = authResult.auth.organizationId;
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
