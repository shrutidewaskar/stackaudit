import { GovernanceEngine } from "../lib/governance/engine";
import { ActionCandidateEngine } from "../lib/governance/actionCandidates/actionCandidateEngine";

async function runGovernanceTests() {
  console.log("=== Running Refined Governance Intelligence Engine Tests ===");
  const orgId = "novatech-labs-uuid";

  // Test 1: Finding generation checks
  const findings = GovernanceEngine.generateFindings(orgId);
  console.log(`Test 1: Generated findings count: ${findings.length} (Expected: 9) - ${findings.length === 9 ? "PASSED" : "FAILED"}`);

  // Test 2: Finding contains evidence first class parameters
  const dormantFinding = findings.find((f) => f.type === "DORMANT_LICENSE");
  const hasEvidence = dormantFinding && dormantFinding.evidence && typeof dormantFinding.evidence.observationPeriod === "string";
  console.log(`Test 2: Finding contains structured explainable evidence logs - ${hasEvidence ? "PASSED" : "FAILED"}`);

  // Test 3: Action candidate references source finding
  if (dormantFinding) {
    const candidateLink = ActionCandidateEngine.mapAction(dormantFinding.type, dormantFinding.id);
    const actionMatched = candidateLink.action === "REVIEW_LICENSE" && candidateLink.sourceFindingId === dormantFinding.id;
    console.log(`Test 3: Action Candidate correctly references finding ID - ${actionMatched ? "PASSED" : "FAILED"}`);
  } else {
    console.log("Test 3: FAILED (Dormant finding missing)");
  }

  // Test 4: Score is reproducible across runs
  const runA = GovernanceEngine.calculateScore(orgId);
  const runB = GovernanceEngine.calculateScore(orgId);
  const reproducible = runA.overallScore === runB.overallScore && runA.overallScore === 76;
  console.log(`Test 4: Deterministic score reproducibility - ${reproducible ? "PASSED" : "FAILED"}`);

  // Test 5: Score dimensions calculation maps 5 dimensions (Visibility, Utilization, Adoption, Redundancy, Data Completeness)
  const scoreBreakdown = GovernanceEngine.calculateScore(orgId);
  const hasFiveDimensions = 
    scoreBreakdown.dimensions.visibility &&
    scoreBreakdown.dimensions.utilization &&
    scoreBreakdown.dimensions.adoption &&
    scoreBreakdown.dimensions.redundancy &&
    scoreBreakdown.dimensions.dataCompleteness;
  console.log(`Test 5: Calculates all 5 governance dimensions - ${hasFiveDimensions ? "PASSED" : "FAILED"}`);

  console.log("=== Refined Governance Test Suite Completed successfully ===");
}

runGovernanceTests().catch(console.error);
export {};
