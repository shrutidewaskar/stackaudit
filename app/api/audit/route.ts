import { NextRequest, NextResponse } from "next/server";
import { saveAudit } from "@/lib/database";
import { generateSummary } from "@/services/generateSummary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      teamSize,
      useCase,
      audit,
      tools,
      userId,
    } = body;

    // Validate input
    if (!teamSize || !useCase || !audit || !tools) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate summary from template
    const summary = generateSummary(audit);

    // Save to database
    const { id, error } = await saveAudit(
      teamSize,
      useCase,
      {
        totalCurrentMonthlySpend: audit.totalCurrentMonthlySpend,
        totalOptimizedMonthlySpend: audit.totalOptimizedMonthlySpend,
        totalMonthlySavings: audit.totalMonthlySavings,
        totalAnnualSavings: audit.totalAnnualSavings,
        percentageSaved: audit.percentageSaved,
        optimizationScore: audit.optimizationScore.label,
        summary: summary,
      },
      tools,
      userId || null
    );

    if (error || !id) {
      return NextResponse.json(
        { error: error || "Failed to save audit" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id, summary },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving audit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
