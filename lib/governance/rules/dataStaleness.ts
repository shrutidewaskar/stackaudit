import { GovernanceFinding } from "../types";
import { GOVERNANCE_THRESHOLDS } from "../thresholds";

export class DataStalenessRule {
  public static evaluate(orgId: string): GovernanceFinding[] {
    const findings: GovernanceFinding[] = [];
    const stalenessThreshold = GOVERNANCE_THRESHOLDS.SYNC_STALENESS_HOURS;

    findings.push({
      id: `finding-stale-sync`,
      organizationId: orgId,
      type: "STALE_SYNC",
      category: "GOVERNANCE",
      severity: "LOW",
      title: "Outdated Directory Sync Status",
      description: `Okta SSO Provider directory synchronization has been stale for over ${stalenessThreshold} hours.`,
      evidence: {
        connectorId: "ws-okta",
        lastSyncHours: 28,
        thresholdHours: stalenessThreshold,
        syncStatus: "Degraded"
      },
      affectedEmployees: [],
      affectedDepartments: [],
      affectedTools: [],
      metrics: { staleHours: 28 },
      detectedAt: new Date().toISOString(),
      status: "NEW",
      recommendedAction: "CONNECT_DATA_SOURCE",
      confidence: 1.0
    });

    return findings;
  }
}
