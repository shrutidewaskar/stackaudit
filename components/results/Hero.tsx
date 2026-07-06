import OptimizationBadge from "@/components/results/OptimizationBadge";
import type { OptimizationScore } from "@/types/results";
import { formatCurrency } from "@/rules/helpers";

interface Props {
  monthly: number;
  annual: number;
  score: OptimizationScore;
}

export default function Hero({
  monthly,
  annual,
  score,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(135deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
              Audit Complete 🎉
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
              Pricing last verified: July 2026
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Potential Savings
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-4">
            <p className="text-6xl font-black tracking-tight text-white md:text-7xl">
              {formatCurrency(monthly)}
            </p>

            <p className="pb-3 text-xl text-zinc-400">
              per month
            </p>
          </div>

          <p className="mt-3 text-lg text-emerald-300">
            {formatCurrency(annual)}/year
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Overall Optimization Score
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <OptimizationBadge tone={score.tone}>
              {score.label}
            </OptimizationBadge>
            <span className="text-sm text-zinc-400">
              {score.description}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}