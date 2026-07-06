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
        "ChatGPT Team is built for workspaces with multiple collaborators. For a single seat, ChatGPT Plus provides identical model capabilities, custom GPT access, and higher priority usage limits at a lower cost.",
    };
  }

  if (tool === "ChatGPT" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Team",
      reason:
        "ChatGPT Enterprise is designed for larger organizations requiring centralized billing, single sign-on (SSO), and custom domain controls. Based on your small team size, ChatGPT Team provides identical GPT-4o capabilities and shared workspaces at a significantly lower cost.",
    };
  }

  if (tool === "Claude" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Team",
      reason:
        "Claude Enterprise is tailored for large-scale deployments needing administrative controls and custom SAML integrations. For teams under 5 users, Claude Team provides access to the same 200k context window and project folders without enterprise overhead.",
    };
  }

  if (tool === "Claude" && plan === "Max" && seats <= 3) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Claude Team/Max plans require minimum seat allocations and administrative setup. If you are operating with 3 or fewer members, Claude Pro is sufficient to handle standard chat, coding, and file analysis workflows.",
    };
  }

  if (tool === "Cursor" && plan === "Business" && seats <= 5) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Cursor Business is designed for larger organizations needing centralized member management and SAML controls. Based on your small team profile, Cursor Pro provides the same unlimited autocomplete, fast model queries, and chat capabilities at a lower price point.",
    };
  }

  if (tool === "Cursor" && plan === "Enterprise" && seats <= 8) {
    return {
      recommendedPlan: "Business",
      reason:
        "Cursor Enterprise features custom billing terms and bespoke data storage policies. A developer team of this size can transition to Cursor Business to utilize central seat provisioning while eliminating enterprise pricing premiums.",
    };
  }

  if (tool === "GitHub Copilot" && plan === "Enterprise" && seats <= 5) {
    return {
      recommendedPlan: "Business",
      reason:
        "GitHub Copilot Enterprise includes custom indexing for internal repositories and advanced documentation queries. Based on your team size, the Business tier delivers standard autocomplete, chat, and CLI features without paying for advanced enterprise indexes.",
    };
  }

  if (tool === "GitHub Copilot" && plan === "Business" && seats === 1) {
    return {
      recommendedPlan: "Individual",
      reason:
        "GitHub Copilot Business provides organization management and audit logs. A single contributor or solo developer can utilize Copilot Individual for personal workspaces to achieve identical IDE autocomplete suggestions.",
    };
  }

  if (tool === "Gemini" && plan === "Ultra" && seats <= 3) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Gemini Ultra/Advanced focuses on intensive workspace integrations. The Pro plan covers standard coding workflows and documentation search templates at lower rates.",
    };
  }

  if (tool === "Windsurf" && plan === "Teams" && seats <= 5) {
    return {
      recommendedPlan: "Pro",
      reason:
        "Windsurf Teams covers organization policies. Smaller developer cohorts can step down to the Pro tier while retaining access to the full Cascade flow and terminal agent capabilities.",
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