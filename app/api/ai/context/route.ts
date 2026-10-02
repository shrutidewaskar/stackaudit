import { NextRequest, NextResponse } from "next/server";
import { AIContextBuilder } from "@/lib/ai/context/contextBuilder";
import { AIContextValidator } from "@/lib/ai/context/contextValidator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, userId, question } = body;

    if (!organizationId || !question) {
      return NextResponse.json(
        { error: "Invalid payload. Missing organizationId or question." },
        { status: 400 }
      );
    }

    const context = await AIContextBuilder.buildContext(
      organizationId,
      userId || "user-compliance-officer",
      question
    );

    // Validate built context before return
    const isValid = AIContextValidator.validate(organizationId, context);
    if (!isValid) {
      return NextResponse.json(
        { error: "AI Context validation failed. Privacy or budget violation." },
        { status: 403 }
      );
    }

    return NextResponse.json(context);
  } catch (error) {
    console.error("AI Context API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
