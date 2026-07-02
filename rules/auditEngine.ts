import { AuditFormData } from "@/types/audit";
import { evaluateTool } from "./recommendations";
import { buildAuditResult } from "./helpers";
import type { AuditResult } from "./types";

export function runAudit(audit: AuditFormData): AuditResult {
  const totalCurrentMonthlySpend = audit.tools.reduce(
    (sum, tool) => sum + tool.monthlySpend,
    0
  );

  const recommendations = audit.tools.map((tool) =>
    evaluateTool(
      tool.tool,
      tool.plan,
      tool.monthlySpend,
      tool.seats
    )
  );

  return buildAuditResult(totalCurrentMonthlySpend, recommendations);
}