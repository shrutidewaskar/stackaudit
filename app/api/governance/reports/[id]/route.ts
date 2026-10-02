import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";
import { requireOrganizationMember } from "@/lib/auth/serverAuth";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireOrganizationMember(request);
    if ("response" in authResult) return authResult.response;

    const { id } = await props.params;
    let report: any = null;

    if (isDevMockMode()) {
      report = localReportsCache.find(
        (r) => r.id === id && r.organizationId === authResult.auth.organizationId
      );
    } else {
      assertSupabaseConfigured();
      const { data, error } = await supabase
        .from("governance_reports")
        .select("*")
        .eq("id", id)
        .eq("organization_id", authResult.auth.organizationId)
        .maybeSingle();

      if (error) {
        throw new Error(`Database Error [governance_reports.selectById]: ${error.message}`);
      }
      report = data;
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found in your organization" }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format"); // export format: pdf, csv, json

    if (format === "json") {
      return NextResponse.json({ format: "json", data: report });
    } else if (format === "csv") {
      const csvContent = `id,reportType,periodStart,periodEnd,generatedAt\n${report.id},${report.report_type || report.reportType},${report.period_start || report.periodStart},${report.period_end || report.periodEnd},${report.generated_at || report.generatedAt}`;
      return new NextResponse(csvContent, {
        headers: { "Content-Type": "text/csv" }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report detail API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
