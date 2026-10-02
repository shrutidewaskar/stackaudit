import { NextRequest, NextResponse } from "next/server";
import { organizationService } from "@/services/enterprise/OrganizationService";

export async function GET(request: NextRequest) {
  try {
    const list = await organizationService.list();
    return NextResponse.json(list);
  } catch (error) {
    console.error("API error listing organizations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, industry, companySize } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Missing name or slug" }, { status: 400 });
    }

    const org = await organizationService.create(name, slug, industry, companySize);
    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    console.error("API error creating organization:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
