interface Props {
  totalRecommendations: number;
  highestSavingTool: string;
  highestSavingAmount: number;
}

export default function RecommendationHeader({
  totalRecommendations,
  highestSavingTool,
  highestSavingAmount,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Recommendations
        </p>

        <h2 className="mt-2 text-3xl font-semibold text-white">
          {totalRecommendations} optimization opportunity
          {totalRecommendations === 1 ? "" : "s"}
        </h2>
      </div>

      <div className="text-sm text-zinc-300">
        <p className="text-zinc-500">Highest saving tool</p>
        <p className="mt-1 font-semibold text-white">
          {highestSavingTool || "No major change needed"}
        </p>
        <p className="text-emerald-300">
          {highestSavingAmount > 0 ? `Up to $${highestSavingAmount.toFixed(0)}/month` : "Already optimized"}
        </p>
      </div>
    </div>
  );
}