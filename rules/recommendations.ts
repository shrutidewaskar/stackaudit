import { getPlanPrice } from "./pricing";
import {
  determineRecommendationSeverity,
  formatCurrency,
} from "./helpers";
import type { Recommendation } from "@/types/results";

type RuleResult = {
  recommendedPlan: string;
  reason: string;
};

function getRecommendationRule(
  tool: string,
  plan: string,
  seats: number
): RuleResult | null {
  if (tool === "ChatGPT" && plan === "Team" && seats <= 1) {
    return {
      recommendedPlan: "Plus",
      reason:
        "ChatGPT Team is built for collaboration. Plus is a better fit for a solo user.",
    };
  }

  if (tool === "ChatGPT" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Team",
      reason:
        "This team size usually does not need enterprise controls yet.",
    };
  }

  if (tool === "Claude" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Team",
      reason:
        "Smaller teams can typically step down from enterprise pricing.",
    };
  }

  if (tool === "Claude" && plan === "Max" && seats <= 3) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Claude Pro is enough for most small-team usage patterns.",
    };
  }

  if (tool === "Cursor" && plan === "Business" && seats <= 5) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Cursor Pro offers strong coverage for smaller teams at a lower cost.",
    };
  }

  if (tool === "Cursor" && plan === "Enterprise" && seats <= 8) {
    return {
      recommendedPlan: "Business",
      reason:
        "Enterprise features appear oversized for this team profile.",
    };
  }

  if (tool === "GitHub Copilot" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Business",
      reason:
        "Business covers most team workflows without enterprise overhead.",
    };
  }

  if (tool === "GitHub Copilot" && plan === "Business" && seats === 1) {
    return {
      recommendedPlan: "Individual",
      reason:
        "A single contributor does not need a team plan.",
    };
  }

  if (tool === "Gemini" && plan === "Ultra" && seats <= 3) {
    return {
      recommendedPlan: "Pro",
      reason:
        "The Pro tier is generally sufficient for lightweight usage.",
    };
  }

  if (tool === "Windsurf" && plan === "Teams" && seats <= 5) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Smaller teams can usually step down to the Pro tier.",
    };
  }

  return null;
}

export function evaluateTool(
  tool: string,
  plan: string,
  monthlySpend: number,
  seats: number
): Recommendation {
  const rule = getRecommendationRule(tool, plan, seats);

  if (!rule) {
    return {
      tool,
      currentPlan: plan,
      recommendedPlan: plan,
      monthlySavings: 0,
      annualSavings: 0,
      reason: "Your current plan appears well suited for your usage.",
      severity: "Low",
      monthlySpend,
    };
  }

  const recommendedPlanPrice = getPlanPrice(tool, rule.recommendedPlan) ?? 0;
  const monthlySavings = Math.max(monthlySpend - recommendedPlanPrice, 0);

  return {
    tool,
    currentPlan: plan,
    recommendedPlan: rule.recommendedPlan,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason: `${rule.reason} Estimated savings: ${formatCurrency(monthlySavings)} per month.`,
    severity: determineRecommendationSeverity(monthlySavings),
    monthlySpend,
  };
}