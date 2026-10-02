import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const orgId = authResult.auth.organizationId;
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type"); // WEEKLY_DIGEST or MONTHLY_EXECUTIVE

    if (isDevMockMode()) {
      const orgReports = localReportsCache.filter(
        (r) => r.organizationId === orgId && (!type || r.reportType === type)
      );

      if (orgReports.length === 0) {
        return NextResponse.json({ error: "No reports found" }, { status: 404 });
      }

      orgReports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
      return NextResponse.json(orgReports[0]);
    }

    assertSupabaseConfigured();
    let query = supabase
      .from("governance_reports")
      .select("*")
      .eq("organization_id", orgId)
      .order("generated_at", { ascending: false })
      .limit(1);

    if (type) {
      query = query.eq("report_type", type);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Database Error [governance_reports.selectLatest]: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No reports found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Latest Report API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
