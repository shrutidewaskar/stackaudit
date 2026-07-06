interface Props {
  summary: string;
}

export default function ExecutiveSummary({
  summary,
}: Props) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
        <h2 className="text-2xl font-semibold">
          Executive Summary
        </h2>
        <span className="text-[10px] text-zinc-500 font-mono">
          ℹ️ This summary is generated from deterministic audit results. AI explains—it does not calculate.
        </span>
      </div>

      <p className="max-w-4xl leading-8 text-zinc-300 text-sm">
        {summary}
      </p>

      <div className="mt-6 border-t border-white/5 pt-4 text-[10px] text-zinc-500 flex items-center gap-2">
        🔒 <span>Your data is processed securely. Sensitive information is never included in public share links.</span>
      </div>
    </section>
  );
}