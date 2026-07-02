import { formatCurrency } from "@/rules/helpers";
import OptimizationBadge from "@/components/results/OptimizationBadge";
import type { Recommendation } from "@/types/results";

interface Props {
  recommendation: Recommendation;
}

function getInitials(tool: string) {
  return tool
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecommendationCard({
  recommendation,
}: Props) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8 hover:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-sm font-semibold text-white shadow-inner">
            {getInitials(recommendation.tool)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-semibold text-white">
                {recommendation.tool}
              </h3>

              <OptimizationBadge tone={recommendation.severity.toLowerCase() as "high" | "medium" | "low"}>
                {recommendation.severity}
              </OptimizationBadge>
            </div>

            <p className="mt-2 text-zinc-400">
              Current Plan
            </p>

            <p className="text-lg font-medium text-white">
              {recommendation.currentPlan}
            </p>
          </div>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
            {recommendation.monthlySavings === 0 ? "Already Optimized" : "Potential Savings"}
          </p>

          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {recommendation.monthlySavings === 0
              ? "Already Optimized"
              : `${formatCurrency(recommendation.monthlySavings)}/month`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
          <p className="text-sm text-zinc-500">Current Plan</p>

          <p className="mt-2 text-xl font-semibold text-white">
            {recommendation.currentPlan || "Unknown"}
          </p>
        </div>

        <div className="flex items-center justify-center text-zinc-500">
          <span className="text-2xl">↓</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-200">Recommended Plan</p>

          <p className="mt-2 text-xl font-semibold text-emerald-300">
            {recommendation.recommendedPlan}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-5">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
          Reason
        </p>

        <p className="mt-2 leading-7 text-zinc-300">
          {recommendation.reason}
        </p>
      </div>
    </article>
  );
}