import KPICards from "@/components/results/KPICards";
import type { AuditResult } from "@/types/results";

interface Props {
  result: AuditResult;
}

export default function SpendComparison({
  result,
}: Props) {

  return (
    <section className="mt-10 space-y-6">

      <div>
        <h2 className="text-2xl font-semibold">
        Spend Comparison
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          The KPI view shows the core comparison numbers that drive the savings model.
        </p>
      </div>

      <KPICards result={result} />

    </section>
  );
}