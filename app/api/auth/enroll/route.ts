import { NextRequest, NextResponse } from "next/server";
import { requireOrganizationMember, requirePermission } from "@/lib/auth/serverAuth";
import { enrollmentTokenService } from "@/services/enterprise/EnrollmentTokenService";
import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";

export interface EnrollmentPayload {
  token: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  employeeId?: string;
  expiresAt: string;
}

/**
 * POST /api/auth/enroll
 * Generates, validates, revokes, or lists persistent enrollment tokens.
 * 
 * Mode 1: An authenticated admin/owner/manager creates an enrollment token for their organization.
 * Mode 2: The extension validates an enrollment token against the backend to verify authorization and retrieve API configuration.
 * Mode 3: An authenticated admin revokes an enrollment token.
 * Mode 4: An authenticated admin lists existing tokens for an organization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, token, organizationId, name, expiresInDays, tokenId } = body;

    // Action 1: Create a secure persistent enrollment token (requires canManageMembers permission)
    if (action === "create") {
      const authResult = await requirePermission(request, "canManageMembers", organizationId);
      if ("response" in authResult) {
        return authResult.response;
      }

      const { auth } = authResult;
      const { rawToken, record } = await enrollmentTokenService.createToken(
        auth.organizationId,
        auth.user.id,
        name || "Browser Extension Device",
        expiresInDays || 30
      );

      // Look up organization name
      let orgName = "Organization";
      if (!isDevMockMode()) {
        assertSupabaseConfigured();
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", auth.organizationId)
          .maybeSingle();
        if (orgData?.name) orgName = orgData.name;
      } else {
        orgName = "NovaTech Labs";
      }

      const payload: EnrollmentPayload = {
        token: rawToken,
        organizationId: auth.organizationId,
        organizationName: orgName,
        userId: auth.user.id,
        employeeId: auth.user.id,
        expiresAt: record.expires_at
      };

      return NextResponse.json({
        success: true,
        pairingToken: payload,
        tokenRecord: {
          id: record.id,
          organization_id: record.organization_id,
          name: record.name,
          status: record.status,
          expires_at: record.expires_at,
          created_at: record.created_at
        }
      }, { status: 201 });
    }

    // Action 2: Validate a token (used by extension during pairing setup)
    if (action === "validate" || (!action && token)) {
      const rawToken = token || body.token;
      if (!rawToken || typeof rawToken !== "string") {
        return NextResponse.json({ error: "Missing enrollment token" }, { status: 400 });
      }

      const record = await enrollmentTokenService.validateToken(rawToken);
      if (!record) {
        return NextResponse.json({ error: "Invalid, expired, or revoked enrollment token." }, { status: 401 });
      }

      // Look up organization name
      let orgName = "Paired Organization";
      if (!isDevMockMode()) {
        assertSupabaseConfigured();
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", record.organization_id)
          .maybeSingle();
        if (orgData?.name) orgName = orgData.name;
      } else {
        orgName = "NovaTech Labs";
      }

      return NextResponse.json({
        valid: true,
        organizationId: record.organization_id,
        organizationName: orgName,
        employeeId: `device-${record.id.substring(0, 8)}`,
        ingestUrl: "/api/usage/events"
      });
    }

    // Action 3: Revoke an enrollment token (requires canManageMembers permission)
    if (action === "revoke") {
      if (!tokenId) {
        return NextResponse.json({ error: "Missing tokenId parameter." }, { status: 400 });
      }

      const authResult = await requirePermission(request, "canManageMembers", organizationId);
      if ("response" in authResult) {
        return authResult.response;
      }

      const { auth } = authResult;
      const revoked = await enrollmentTokenService.revokeToken(tokenId, auth.organizationId, auth.user.id);
      if (!revoked) {
        return NextResponse.json({ error: "Token not found or already revoked." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Enrollment token revoked successfully."
      });
    }

    // Action 4: List enrollment tokens for an organization (requires canManageMembers permission)
    if (action === "list") {
      const authResult = await requirePermission(request, "canManageMembers", organizationId);
      if ("response" in authResult) {
        return authResult.response;
      }

      const { auth } = authResult;
      const tokens = await enrollmentTokenService.listTokens(auth.organizationId);

      return NextResponse.json({
        success: true,
        tokens
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported actions: create, validate, revoke, list." }, { status: 400 });
  } catch (error: any) {
    console.error("Enrollment API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

