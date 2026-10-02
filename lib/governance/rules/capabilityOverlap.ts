import { GovernanceFinding } from "../types";
import { CAPABILITY_MAPPINGS } from "../../sync/governanceMetrics";

export class CapabilityOverlapRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];
    const capToTools = new Map<string, string[]>();

    CAPABILITY_MAPPINGS.forEach((item) => {
      item.capabilities.forEach((cap) => {
        if (!capToTools.has(cap)) capToTools.set(cap, []);
        capToTools.get(cap)!.push(item.tool);
      });
    });

    for (const [cap, tools] of capToTools.entries()) {
      if (tools.length > 1) {
        findings.push({
          id: `finding-overlap-${cap.replace(/\s+/g, "-").toLowerCase()}`,
          organizationId: orgId,
          type: "CAPABILITY_OVERLAP",
          category: "REDUNDANCY",
          severity: "MEDIUM",
          title: `Overlapping Vendor Capabilities: ${cap}`,
          description: `Multiple tools (${tools.join(", ")}) provide overlapping capabilities for "${cap}".`,
          evidence: {
            capability: cap,
            overlappingTools: tools,
            totalToolsCount: tools.length,
            licenseRedundancyFactor: "High"
          },
          affectedEmployees: [],
          affectedDepartments: ["dept-eng", "dept-des"],
          affectedTools: tools,
          metrics: { overlapsCount: tools.length },
          detectedAt: new Date().toISOString(),
          status: "NEW",
          recommendedAction: "REVIEW_VENDOR_OVERLAP",
          confidence: 0.9
        });
      }
    }

    return findings;
  }
}
