import type { AuditResult } from "@/types/results";
import { formatCurrency } from "@/rules/helpers";

export function generateSummary(result: AuditResult) {
  const savingsLine =
    result.highestSavingAmount > 0
      ? `${result.highestSavingTool} is the largest opportunity at ${formatCurrency(result.highestSavingAmount)} per month.`
      : "No individual tool stands out as a major waste source.";

  return [
    `Your current AI stack costs ${formatCurrency(result.totalCurrentMonthlySpend)} per month and can be reduced to ${formatCurrency(result.totalOptimizedMonthlySpend)} with the recommendations below.`,
    `The audit identified ${formatCurrency(result.totalMonthlySavings)} in monthly savings, which equals ${formatCurrency(result.totalAnnualSavings)} annually and a ${result.percentageSaved.toFixed(1)}% reduction overall.`,
    savingsLine,
    `Most of the savings come from plan alignment rather than workflow changes, so the impact should be achievable without disrupting how the team works.`,
    `If you prioritize the highest-value recommendations first, the stack becomes materially leaner while preserving the tools your team already knows.`,
  ].join(" ");
}