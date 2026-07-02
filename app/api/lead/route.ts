import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { auditId, email, company, role, teamSize } = body;

    // Validate input
    if (!auditId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Save lead
    if (auditId === "demo") {
      return NextResponse.json(
        { id: "demo-lead", success: true },
        { status: 201 }
      );
    }

    const { id, error } = await saveLead(
      auditId,
      email,
      company || null,
      role || null,
      teamSize || null
    );

    if (error || !id) {
      return NextResponse.json(
        { error: error || "Failed to save lead" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
