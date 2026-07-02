import type {
  AuditResult,
  OptimizationScore,
  Recommendation,
  RecommendationSeverity,
} from "@/types/results";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculatePercentageSaved(
  currentSpend: number,
  savings: number
) {
  if (currentSpend <= 0) {
    return 0;
  }

  return (savings / currentSpend) * 100;
}

export function calculateOptimizationScore(
  savings: number
): OptimizationScore {
  if (savings === 0) {
    return {
      label: "Excellent",
      tone: "excellent",
      description: "No material savings opportunity detected.",
    };
  }

  if (savings < 50) {
    return {
      label: "Good",
      tone: "good",
      description: "A few small improvements could still trim spend.",
    };
  }

  if (savings < 200) {
    return {
      label: "Fair",
      tone: "fair",
      description: "Meaningful optimization is available with plan changes.",
    };
  }

  return {
    label: "Poor",
    tone: "poor",
    description: "Significant optimization opportunity across the stack.",
  };
}

export function determineRecommendationSeverity(
  savings: number
): RecommendationSeverity {
  if (savings >= 200) {
    return "High";
  }

  if (savings >= 50) {
    return "Medium";
  }

  return "Low";
}

export function getHighestSavingRecommendation(
  recommendations: Recommendation[]
) {
  return recommendations.reduce(
    (best, current) =>
      current.monthlySavings > best.monthlySavings ? current : best,
    recommendations[0] ?? {
      tool: "",
      currentPlan: "",
      recommendedPlan: "",
      monthlySavings: 0,
      annualSavings: 0,
      reason: "",
      severity: "Low",
    }
  );
}

export function buildAuditResult(
  totalCurrentMonthlySpend: number,
  recommendations: Recommendation[]
): AuditResult {
  const totalMonthlySavings = recommendations.reduce(
    (sum, recommendation) => sum + recommendation.monthlySavings,
    0
  );
  const totalOptimizedMonthlySpend = Math.max(
    totalCurrentMonthlySpend - totalMonthlySavings,
    0
  );
  const highestSaving = getHighestSavingRecommendation(recommendations);

  return {
    totalCurrentMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    percentageSaved: calculatePercentageSaved(
      totalCurrentMonthlySpend,
      totalMonthlySavings
    ),
    optimizationScore: calculateOptimizationScore(totalMonthlySavings),
    highestSavingTool: highestSaving.tool,
    highestSavingAmount: highestSaving.monthlySavings,
    recommendations,
  };
}