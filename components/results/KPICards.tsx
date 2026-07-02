import OptimizationBadge from "@/components/results/OptimizationBadge";
import type { AuditResult } from "@/types/results";
import { formatCurrency } from "@/rules/helpers";

interface Props {
  result: AuditResult;
}

function MetricCard({
  label,
  value,
  accent,
  note,
}: {
  label: string;
  value: string;
  accent: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20">
      <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className={`text-3xl font-semibold ${accent}`}>{value}</p>
        <OptimizationBadge tone="low">Live Metric</OptimizationBadge>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-400">{note}</p>
    </div>
  );
}

export default function KPICards({ result }: Props) {
  return (
    <section className="mt-10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Current Monthly Spend"
          value={formatCurrency(result.totalCurrentMonthlySpend)}
          accent="text-zinc-100"
          note="What you are paying today across the captured tools."
        />

        <MetricCard
          label="Optimized Monthly Spend"
          value={formatCurrency(result.totalOptimizedMonthlySpend)}
          accent="text-emerald-300"
          note="Projected spend after applying the recommended plan changes."
        />

        <MetricCard
          label="Monthly Savings"
          value={formatCurrency(result.totalMonthlySavings)}
          accent="text-sky-300"
          note="Estimated recurring monthly reduction from the audit."
        />

        <MetricCard
          label="Annual Savings"
          value={formatCurrency(result.totalAnnualSavings)}
          accent="text-emerald-300"
          note="Projected annual impact if the optimized plans are adopted."
        />

        <MetricCard
          label="Percentage Saved"
          value={`${result.percentageSaved.toFixed(1)}%`}
          accent="text-amber-300"
          note="How much of your current monthly AI spend can be removed."
        />
      </div>
    </section>
  );
}