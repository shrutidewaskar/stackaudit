import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { membershipService, RoleType, RolePermissions } from "@/services/enterprise/MembershipService";
import { enrollmentTokenService } from "@/services/enterprise/EnrollmentTokenService";
import { isExplicitDevMode, AuthUser } from "./devMode";

export interface AuthenticatedContext {
  user: AuthUser;
  organizationId: string;
  role: RoleType;
}

/**
 * Resolves the authenticated user from Supabase Auth JWT token in Authorization header or cookie.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  let token: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // Fallback to cookie if present
  if (!token) {
    token = request.cookies.get("sb-access-token")?.value || null;
  }

  if (token) {
    // Check enrollment token in authorization header (format: Bearer stk_enroll_...)
    if (token.startsWith("stk_enroll_")) {
      const record = await enrollmentTokenService.validateToken(token);
      if (record) {
        return {
          id: `ext-device-${record.id}`,
          email: `device@stackaudit.local`
        };
      }
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getUser(token).catch(() => ({ data: { user: null }, error: null }));
      if (!error && data?.user?.id) {
        return {
          id: data.user.id,
          email: data.user.email || ""
        };
      }
    } catch {
      // Ignore token verification exception and proceed to dev fallback check
    }
  }

  // Check explicit development mock bypass
  if (isExplicitDevMode()) {
    const devUserId = request.headers.get("x-dev-user-id");
    if (devUserId) {
      return {
        id: devUserId,
        email: `${devUserId}@test.local`
      };
    }
  }

  return null;
}

/**
 * Requires an authenticated user session. Returns 401 if missing.
 */
export async function requireUser(request: NextRequest): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized: Valid authentication token is required." },
        { status: 401 }
      )
    };
  }
  return { user };
}

/**
 * Requires the user to be a member of the requested organization or user's primary organization.
 * NEVER trusts the browser-supplied organization_id blindly.
 */
export async function requireOrganizationMember(
  request: NextRequest,
  targetOrgId?: string | null,
  minRole?: RoleType
): Promise<{ auth: AuthenticatedContext } | { response: NextResponse }> {
  const userResult = await requireUser(request);
  if ("response" in userResult) {
    return userResult;
  }

  const user = userResult.user;

  // If this is an extension device token, look up its bound organization exclusively from the token record
  if (user.id.startsWith("ext-device-")) {
    const authHeader = request.headers.get("authorization");
    const rawToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : "";
    const record = await enrollmentTokenService.validateToken(rawToken);

    if (!record) {
      return {
        response: NextResponse.json(
          { error: "Unauthorized: Enrollment token is invalid, expired, or revoked." },
          { status: 401 }
        )
      };
    }

    // Strict tenant boundary: targetOrgId must match token record organization_id if provided
    if (targetOrgId && targetOrgId !== record.organization_id) {
      return {
        response: NextResponse.json(
          { error: "Forbidden: Token is not authorized for the requested organization." },
          { status: 403 }
        )
      };
    }

    return {
      auth: {
        user,
        organizationId: record.organization_id,
        role: "member"
      }
    };
  }

  // Determine intended organization ID: passed parameter or extracted from searchParams/headers
  const requestedOrgId =
    targetOrgId ||
    request.nextUrl.searchParams.get("orgId") ||
    request.headers.get("x-organization-id");

  // Lookup user's memberships
  const memberships = await membershipService.listMembers(requestedOrgId || "");
  let userMembership = memberships.find((m) => m.user_id === user.id && m.status === "active");

  // In test/dev mode with mock seeder:
  if (!userMembership && isExplicitDevMode()) {
    const defaultOrg = "novatech-labs-uuid";
    const targetOrg = requestedOrgId || defaultOrg;
    const testMember = await membershipService.getMember(targetOrg, user.id);
    if (testMember && testMember.status === "active") {
      userMembership = testMember;
    } else if (!requestedOrgId && user.id === "user-uuid-1") {
      // Default dev fallback membership only for root default user with unspecified org
      userMembership = {
        organization_id: defaultOrg,
        user_id: user.id,
        role: "admin",
        status: "active",
        joined_at: new Date().toISOString()
      };
    }
  }

  if (!userMembership) {
    return {
      response: NextResponse.json(
        { error: "Forbidden: You are not a member of the requested organization." },
        { status: 403 }
      )
    };
  }

  // Check role hierarchy if minRole is specified
  if (minRole) {
    const roleHierarchy: Record<RoleType, number> = {
      viewer: 1,
      member: 2,
      manager: 3,
      admin: 4,
      owner: 5
    };

    if (roleHierarchy[userMembership.role] < roleHierarchy[minRole]) {
      return {
        response: NextResponse.json(
          { error: `Forbidden: This action requires at least ${minRole} role permissions.` },
          { status: 403 }
        )
      };
    }
  }

  return {
    auth: {
      user,
      organizationId: userMembership.organization_id,
      role: userMembership.role
    }
  };
}

/**
 * Requires a specific named permission for the organization.
 */
export async function requirePermission(
  request: NextRequest,
  permission: keyof RolePermissions,
  targetOrgId?: string | null
): Promise<{ auth: AuthenticatedContext } | { response: NextResponse }> {
  const memberResult = await requireOrganizationMember(request, targetOrgId);
  if ("response" in memberResult) {
    return memberResult;
  }

  const { auth } = memberResult;
  const hasPerm = await membershipService.hasPermission(auth.organizationId, auth.user.id, permission);

  if (!hasPerm) {
    return {
      response: NextResponse.json(
        { error: `Forbidden: Insufficient permissions to perform action: ${permission}` },
        { status: 403 }
      )
    };
  }

  return { auth };
}
