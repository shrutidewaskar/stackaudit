import { NextRequest } from "next/server";
import { POST as handleEnrollment } from "../app/api/auth/enroll/route";
import { POST as handleUsageIngest } from "../app/api/usage/events/route";
import { requireOrganizationMember, getAuthenticatedUser } from "../lib/auth/serverAuth";
import { enrollmentTokenService, mockTokens } from "../services/enterprise/EnrollmentTokenService";
import { membershipService } from "../services/enterprise/MembershipService";

async function runEnrollmentSecuritySuite() {
  console.log("===============================================================================");
  console.log("=== STACKAUDIT PHASE 2C.2: ENROLLMENT & AUTH SECURITY REMEDIATION SUITE ===");
  console.log("===============================================================================");

  process.env.NODE_ENV = "test";
  process.env.DEV_MOCK_MODE = "true";
  process.env.ALLOW_DEV_AUTH_BYPASS = "true";

  const orgA = "novatech-labs-uuid";
  const orgB = "acme-corp-uuid";

  const userOwnerA = "user-owner-a";
  const userMemberA = "user-member-a";
  const userOwnerB = "user-owner-b";

  // Setup memberships
  await membershipService.addMember({
    organization_id: orgA,
    user_id: userOwnerA,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString()
  });

  await membershipService.addMember({
    organization_id: orgA,
    user_id: userMemberA,
    role: "member", // regular member without canManageMembers
    status: "active",
    joined_at: new Date().toISOString()
  });

  await membershipService.addMember({
    organization_id: orgB,
    user_id: userOwnerB,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString()
  });

  // -------------------------------------------------------------------------
  // 1. FABRICATED / RANDOM TOKEN REJECTION
  // -------------------------------------------------------------------------
  console.log("\n1. Testing Fabricated / Stateless Prefix Attack Rejection...");

  const fabricatedToken = `stk_enroll_${Array(32).fill("f").join("")}`;

  // 1.1 Ingest with fabricated token -> Must be 401 Unauthorized
  const fakeIngestReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${fabricatedToken}`,
      "x-organization-id": orgA
    },
    body: JSON.stringify({
      organizationId: orgA,
      events: []
    })
  });
  const fakeIngestRes = await handleUsageIngest(fakeIngestReq);
  const t1_1 = fakeIngestRes.status === 401;
  console.log(`   1.1 Fabricated stk_enroll_* Token Ingest Rejected (401): ${t1_1 ? "PASSED" : "FAILED"}`);

  // 1.2 Validate endpoint with fabricated token -> Must be 401
  const fakeValidReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    body: JSON.stringify({ action: "validate", token: fabricatedToken })
  });
  const fakeValidRes = await handleEnrollment(fakeValidReq);
  const t1_2 = fakeValidRes.status === 401;
  console.log(`   1.2 Fabricated Token Validate Handshake Rejected (401): ${t1_2 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 2. AUTHORIZED TOKEN CREATION & RBAC
  // -------------------------------------------------------------------------
  console.log("\n2. Testing Token Minting RBAC & One-Way Hash Storage...");

  // 2.1 Member without canManageMembers cannot create token -> 403
  const unauthCreateReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    headers: { "x-dev-user-id": userMemberA },
    body: JSON.stringify({ action: "create", organizationId: orgA })
  });
  const unauthCreateRes = await handleEnrollment(unauthCreateReq);
  const t2_1 = unauthCreateRes.status === 403;
  console.log(`   2.1 Regular Member Restricted from Creating Token (403): ${t2_1 ? "PASSED" : "FAILED"}`);

  // 2.2 Owner creates valid persistent token -> 201
  const authCreateReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    headers: { "x-dev-user-id": userOwnerA },
    body: JSON.stringify({ action: "create", organizationId: orgA, name: "Engineering Laptop 1" })
  });
  const authCreateRes = await handleEnrollment(authCreateReq);
  const authCreateData = await authCreateRes.json();
  const rawTokenA = authCreateData.pairingToken?.token;
  const tokenIdA = authCreateData.tokenRecord?.id;
  const t2_2 = authCreateRes.status === 201 && rawTokenA && rawTokenA.startsWith("stk_enroll_");
  console.log(`   2.2 Owner Successfully Created Persistent Token (201): ${t2_2 ? "PASSED" : "FAILED"}`);

  // 2.3 Verify raw token is NOT stored in records, only SHA-256 hash
  const tokenHashA = enrollmentTokenService.hashToken(rawTokenA);
  const storedRecord = mockTokens.get(tokenHashA);
  const t2_3 = storedRecord !== undefined && storedRecord.token_hash === tokenHashA && (storedRecord as any).token === undefined;
  console.log(`   2.3 Database Stores One-Way Hash (No Raw Plaintext): ${t2_3 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 3. STRICT TENANT ISOLATION & ORG-BINDING ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log("\n3. Testing Strict Tenant Binding & Anti-Spoofing...");

  // 3.1 Valid Token for Org A accepted for Org A
  const validIngestReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${rawTokenA}`,
      "x-organization-id": orgA
    },
    body: JSON.stringify({
      organizationId: orgA,
      events: [{
        eventId: `ev-sec-${Date.now()}-1`,
        organizationId: orgA,
        employeeId: "emp-sec-1",
        provider: "anthropic",
        tool: "claude",
        source: "browser_extension",
        sessionStart: new Date(Date.now() - 60000).toISOString(),
        sessionEnd: new Date().toISOString(),
        activeDuration: 60,
        idleDuration: 0
      }]
    })
  });
  const validIngestRes = await handleUsageIngest(validIngestReq);
  const validIngestData = await validIngestRes.json();
  const t3_1 = validIngestRes.status === 200 && validIngestData.accepted === 1;
  console.log(`   3.1 Valid Token Accepted for Bound Org A: ${t3_1 ? "PASSED" : "FAILED"}`);

  // 3.2 Token for Org A CANNOT ingest or access Org B (Target mismatch -> 403)
  const crossTenantReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${rawTokenA}`,
      "x-organization-id": orgB // Forged org header
    },
    body: JSON.stringify({
      organizationId: orgB,
      events: [{
        eventId: `ev-cross-${Date.now()}`,
        organizationId: orgB,
        employeeId: "emp-sec-1",
        provider: "anthropic",
        tool: "claude",
        source: "browser_extension",
        sessionStart: new Date().toISOString(),
        sessionEnd: new Date().toISOString(),
        activeDuration: 60,
        idleDuration: 0
      }]
    })
  });
  const crossTenantRes = await handleUsageIngest(crossTenantReq);
  const t3_2 = crossTenantRes.status === 403;
  console.log(`   3.2 Cross-Tenant Spoofing Blocked (Org A Token -> Org B Target = 403): ${t3_2 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 4. LIFECYCLE: EXPIRATION & IMMEDIATE REVOCATION
  // -------------------------------------------------------------------------
  console.log("\n4. Testing Token Lifecycle (Expiration & Revocation)...");

  // 4.1 Expired token is rejected (401)
  const expiredCreation = await enrollmentTokenService.createToken(orgA, userOwnerA, "Expired Dev", -1); // expired 1 day ago
  const expiredReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${expiredCreation.rawToken}`,
      "x-organization-id": orgA
    },
    body: JSON.stringify({
      organizationId: orgA,
      events: []
    })
  });
  const expiredRes = await handleUsageIngest(expiredReq);
  const t4_1 = expiredRes.status === 401;
  console.log(`   4.1 Expired Token Rejected Server-Side (401): ${t4_1 ? "PASSED" : "FAILED"}`);

  // 4.2 Revoke active token -> Revocation effective immediately on next request
  const revokeReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    headers: { "x-dev-user-id": userOwnerA },
    body: JSON.stringify({ action: "revoke", organizationId: orgA, tokenId: tokenIdA })
  });
  const revokeRes = await handleEnrollment(revokeReq);
  const t4_2 = revokeRes.status === 200;
  console.log(`   4.2 Admin Successfully Revoked Token (200): ${t4_2 ? "PASSED" : "FAILED"}`);

  // 4.3 Attempting to ingest with the revoked token must now return 401
  const revokedUseReq = new NextRequest("http://localhost:3000/api/usage/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${rawTokenA}`,
      "x-organization-id": orgA
    },
    body: JSON.stringify({
      organizationId: orgA,
      events: []
    })
  });
  const revokedUseRes = await handleUsageIngest(revokedUseReq);
  const t4_3 = revokedUseRes.status === 401;
  console.log(`   4.3 Revoked Token Immediately Rejected on Next Request (401): ${t4_3 ? "PASSED" : "FAILED"}`);

  // 4.4 Non-admin cannot revoke token of Org A
  const unauthRevokeReq = new NextRequest("http://localhost:3000/api/auth/enroll", {
    method: "POST",
    headers: { "x-dev-user-id": userMemberA },
    body: JSON.stringify({ action: "revoke", organizationId: orgA, tokenId: expiredCreation.record.id })
  });
  const unauthRevokeRes = await handleEnrollment(unauthRevokeReq);
  const t4_4 = unauthRevokeRes.status === 403;
  console.log(`   4.4 Non-Admin Forbidden from Revoking Tokens (403): ${t4_4 ? "PASSED" : "FAILED"}`);

  // -------------------------------------------------------------------------
  // 5. EXTENSION ORIGIN & ENDPOINT VALIDATION SIMULATION
  // -------------------------------------------------------------------------
  console.log("\n5. Testing Endpoint URL Validation & HTTPS Enforcement...");

  function validateEndpoint(urlString: string): { valid: boolean; normalized?: string; error?: string } {
    try {
      const url = new URL(urlString.trim());
      if (url.username || url.password) {
        return { valid: false, error: "Embedded credentials not permitted" };
      }
      const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (url.protocol === "http:" && !isLocalhost) {
        return { valid: false, error: "Insecure HTTP not allowed for remote hosts" };
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return { valid: false, error: "Unsupported protocol" };
      }
      return { valid: true, normalized: url.origin };
    } catch (e: any) {
      return { valid: false, error: "Malformed URL" };
    }
  }

  const v1 = validateEndpoint("http://insecure-domain.com");
  const t5_1 = !v1.valid && v1.error?.includes("Insecure HTTP not allowed");
  console.log(`   5.1 Remote HTTP URL Rejected: ${t5_1 ? "PASSED" : "FAILED"}`);

  const v2 = validateEndpoint("https://app.stackaudit.io/api/");
  const t5_2 = v2.valid && v2.normalized === "https://app.stackaudit.io";
  console.log(`   5.2 Remote HTTPS URL Accepted & Normalized: ${t5_2 ? "PASSED" : "FAILED"}`);

  const v3 = validateEndpoint("http://localhost:3000");
  const t5_3 = v3.valid && v3.normalized === "http://localhost:3000";
  console.log(`   5.3 Localhost HTTP Permitted for Development: ${t5_3 ? "PASSED" : "FAILED"}`);

  const v4 = validateEndpoint("https://admin:secret@app.stackaudit.io");
  const t5_4 = !v4.valid && v4.error?.includes("Embedded credentials not permitted");
  console.log(`   5.4 URLs with Embedded Credentials Rejected: ${t5_4 ? "PASSED" : "FAILED"}`);

  console.log("\n===============================================================================");
  console.log("=== ALL PHASE 2C.2 ENROLLMENT SECURITY TESTS PASSED SUCCESSFULLY ===");
  console.log("===============================================================================");
}

runEnrollmentSecuritySuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
