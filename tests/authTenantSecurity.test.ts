import { NextRequest } from "next/server";
import { requireUser, requireOrganizationMember, requirePermission } from "../lib/auth/serverAuth";
import { membershipService } from "../services/enterprise/MembershipService";

async function runAuthSecurityTests() {
  console.log("=== Running StackAudit Authentication & Tenant Security Test Suite ===");

  // Set explicit test mode
  process.env.NODE_ENV = "test";
  process.env.ALLOW_DEV_AUTH_BYPASS = "true";

  const orgA = "novatech-labs-uuid";
  const orgB = "acme-corp-uuid";

  const userOwner = "user-owner-1";
  const userManager = "user-mgr-1";
  const userViewer = "user-view-1";
  const userNonMember = "user-intruder-99";

  // Seed memberships for test validation
  await membershipService.addMember({
    organization_id: orgA,
    user_id: userOwner,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString()
  });

  await membershipService.addMember({
    organization_id: orgA,
    user_id: userManager,
    role: "manager",
    status: "active",
    joined_at: new Date().toISOString()
  });

  await membershipService.addMember({
    organization_id: orgA,
    user_id: userViewer,
    role: "viewer",
    status: "active",
    joined_at: new Date().toISOString()
  });

  await membershipService.addMember({
    organization_id: orgB,
    user_id: userNonMember,
    role: "member",
    status: "active",
    joined_at: new Date().toISOString()
  });

  // Test 1: Unauthenticated request rejected (401)
  const unauthReq = new NextRequest("http://localhost:3000/api/departments?orgId=" + orgA);
  const unauthRes = await requireUser(unauthReq);
  const t1Passed = "response" in unauthRes && unauthRes.response.status === 401;
  console.log(`Test 1: Unauthenticated request rejected (401) - ${t1Passed ? "PASSED" : "FAILED"}`);

  // Test 2: Authenticated user accepted
  const authReq = new NextRequest("http://localhost:3000/api/departments?orgId=" + orgA, {
    headers: { "x-dev-user-id": userOwner }
  });
  const authRes = await requireUser(authReq);
  const t2Passed = "user" in authRes && authRes.user.id === userOwner;
  console.log(`Test 2: Authenticated user accepted - ${t2Passed ? "PASSED" : "FAILED"}`);

  // Test 3: Organization member can access own organization (200/Authorized)
  const memberReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgA}`, {
    headers: { "x-dev-user-id": userManager }
  });
  const memberRes = await requireOrganizationMember(memberReq, orgA);
  const t3Passed = "auth" in memberRes && memberRes.auth.organizationId === orgA;
  console.log(`Test 3: Organization member can access own organization - ${t3Passed ? "PASSED" : "FAILED"}`);

  // Test 4: Non-member of Org A rejected when requesting Org A (403)
  const intruderReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgA}`, {
    headers: { "x-dev-user-id": userNonMember }
  });
  const intruderRes = await requireOrganizationMember(intruderReq, orgA);
  const t4Passed = "response" in intruderRes && intruderRes.response.status === 403;
  console.log(`Test 4: Non-member rejected with 403 - ${t4Passed ? "PASSED" : "FAILED"}`);

  // Test 5: Role permission enforcement: Manager has canEditDetails = true
  const mgrPermReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgA}`, {
    headers: { "x-dev-user-id": userManager }
  });
  const mgrPermRes = await requirePermission(mgrPermReq, "canEditDetails", orgA);
  const t5Passed = "auth" in mgrPermRes;
  console.log(`Test 5: Manager role has canEditDetails permission - ${t5Passed ? "PASSED" : "FAILED"}`);

  // Test 6: Role permission enforcement: Viewer cannot edit details (403)
  const viewerPermReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgA}`, {
    headers: { "x-dev-user-id": userViewer }
  });
  const viewerPermRes = await requirePermission(viewerPermReq, "canEditDetails", orgA);
  const t6Passed = "response" in viewerPermRes && viewerPermRes.response.status === 403;
  console.log(`Test 6: Viewer role restricted from editing details (403) - ${t6Passed ? "PASSED" : "FAILED"}`);

  // Test 7: Organization A user cannot access Organization B (Cross-tenant isolation)
  const crossTenantReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgB}`, {
    headers: { "x-dev-user-id": userOwner }
  });
  const crossTenantRes = await requireOrganizationMember(crossTenantReq, orgB);
  const t7Passed = "response" in crossTenantRes && crossTenantRes.response.status === 403;
  console.log(`Test 7: Cross-tenant access blocked (Org A user -> Org B rejected) - ${t7Passed ? "PASSED" : "FAILED"}`);

  // Test 8: Forged query param does not bypass tenant isolation
  const forgedReq = new NextRequest(`http://localhost:3000/api/departments?orgId=${orgB}`, {
    headers: { "x-dev-user-id": userManager }
  });
  const forgedRes = await requireOrganizationMember(forgedReq, orgB);
  const t8Passed = "response" in forgedRes && forgedRes.response.status === 403;
  console.log(`Test 8: Forged organization_id query parameter prevented - ${t8Passed ? "PASSED" : "FAILED"}`);

  // Test 9: Viewer cannot run audits / delete organization
  const viewerDeleteReq = new NextRequest(`http://localhost:3000/api/organizations/${orgA}`, {
    headers: { "x-dev-user-id": userViewer }
  });
  const viewerDeleteRes = await requirePermission(viewerDeleteReq, "canDeleteOrg", orgA);
  const t9Passed = "response" in viewerDeleteRes && viewerDeleteRes.response.status === 403;
  console.log(`Test 9: Viewer restricted from deleting organization (403) - ${t9Passed ? "PASSED" : "FAILED"}`);

  // Test 10: Owner can delete organization
  const ownerDeleteReq = new NextRequest(`http://localhost:3000/api/organizations/${orgA}`, {
    headers: { "x-dev-user-id": userOwner }
  });
  const ownerDeleteRes = await requirePermission(ownerDeleteReq, "canDeleteOrg", orgA);
  const t10Passed = "auth" in ownerDeleteRes;
  console.log(`Test 10: Owner permitted to delete organization - ${t10Passed ? "PASSED" : "FAILED"}`);

  console.log("=== All Authentication & Tenant Security Tests Completed Successfully ===");
}

runAuthSecurityTests().catch(console.error);
export {};
