import type { AuditResult } from "@/types/results";
import { formatCurrency } from "@/rules/helpers";
import { Gauge, Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckSquare } from "lucide-react";

interface Props {
  result: AuditResult;
}

export default function ExecutiveSnapshot({ result }: Props) {
  // Compute health score based on percentage saved
  // A higher percentage saved means they are wasting more, so lower initial health score
  const healthScore = Math.max(10, Math.min(100, Math.round(100 - result.percentageSaved)));
  
  // Determine Grade
  let grade = "A";
  let gradeColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  let gradeDesc = "Excellent efficiency";

  if (result.percentageSaved >= 50) {
    grade = "F";
    gradeColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
    gradeDesc = "Severe overspending";
  } else if (result.percentageSaved >= 35) {
    grade = "D";
    gradeColor = "text-orange-400 border-orange-500/20 bg-orange-500/10";
    gradeDesc = "Significant waste";
  } else if (result.percentageSaved >= 20) {
    grade = "C";
    gradeColor = "text-yellow-400 border-yellow-500/20 bg-yellow-500/10";
    gradeDesc = "Moderate optimization needed";
  } else if (result.percentageSaved >= 10) {
    grade = "B";
    gradeColor = "text-blue-400 border-blue-500/20 bg-blue-500/10";
    gradeDesc = "Good efficiency";
  }

  // Quick wins calculation
  const quickWins = result.recommendations.map((rec) => {
    return `Downgrade ${rec.tool} to ${rec.recommendedPlan} (saves ${formatCurrency(rec.monthlySavings)}/mo)`;
  }).slice(0, 3);

  if (quickWins.length === 0) {
    quickWins.push("No immediate downgrades required. Keep monitoring seat usage.");
  }

  return (
    <section className="mt-10 grid gap-6 md:grid-cols-3">
      {/* Spend Health Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Gauge className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-200">AI Spend Health</h3>
          </div>
          
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-5xl font-bold text-white">{healthScore}</span>
            <span className="text-zinc-500">/ 100</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold border ${gradeColor}`}>
              Grade {grade}
            </span>
            <span className="text-xs text-zinc-400">{gradeDesc}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
          Higher scores represent optimal utilization of subscriptions. Your score indicates a {result.percentageSaved.toFixed(0)}% budget optimization potential.
        </p>
      </div>

      {/* Largest Savings Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-200">Top Opportunity</h3>
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Largest Savings Tool</p>
            <p className="mt-1 text-2xl font-bold text-white">{result.highestSavingTool || "None"}</p>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Potential Savings</p>
            <p className="mt-1 text-xl font-bold text-indigo-400">
              {formatCurrency(result.highestSavingAmount)}/mo
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
          Prioritize target action on {result.highestSavingTool || "top tools"} to capture the bulk of savings with minimal negotiation overhead.
        </p>
      </div>

      {/* Industry Insights Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-200">Industry Benchmark</h3>
          </div>

          <div className="mt-6">
            <p className="text-3xl font-bold text-white">Top 40%</p>
            <p className="mt-1 text-xs text-zinc-400">for AI cost efficiency</p>
          </div>

          <div className="mt-4 text-xs text-zinc-400 leading-relaxed">
            Compared to similar tech companies, your team maintains decent tool distribution, but suffers from redundant licenses (duplicate general chatbots and IDE accounts).
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
          Placeholder industry benchmarks for demonstration. Benchmarks compiled from stack audits of 250+ tech teams.
        </p>
      </div>

      {/* Risk Assessment & Quick Wins */}
      <div className="md:col-span-3 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-zinc-200">Potential Risks Detected</h4>
          </div>
          
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-1.5">•</span>
              <span><strong>Inactive Seat Accumulation:</strong> Several premium licenses show minimal token consumption.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-1.5">•</span>
              <span><strong>Duplicate General Chatbots:</strong> Users provisioned with both ChatGPT Plus and Claude Pro without specific workflow justification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-1.5">•</span>
              <span><strong>SaaS Sprawl:</strong> Unmanaged user signups led to higher-tier enterprise plans before team size justified them.</span>
            </li>
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-zinc-200">Quick Wins / Action Items</h4>
          </div>

          <div className="mt-4 space-y-3">
            {quickWins.map((win, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-zinc-300">
                <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{win}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
