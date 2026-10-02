import { NextRequest, NextResponse } from "next/server";
import { localReportsCache } from "@/lib/governance/continuous/digestService";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const report = localReportsCache.find((r) => r.id === id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format"); // export format: pdf, csv, json

    if (format === "json") {
      return NextResponse.json({ format: "json", data: report });
    } else if (format === "csv") {
      const csvContent = `id,reportType,periodStart,periodEnd,generatedAt\n${report.id},${report.reportType},${report.periodStart},${report.periodEnd},${report.generatedAt}`;
      return new NextResponse(csvContent, {
        headers: { "Content-Type": "text/csv" }
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
