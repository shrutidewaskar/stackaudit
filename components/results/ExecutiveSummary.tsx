interface Props {
  summary: string;
}

export default function ExecutiveSummary({
  summary,
}: Props) {
  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">

      <h2 className="text-2xl font-semibold">
        Executive Summary
      </h2>

      <p className="mt-5 max-w-4xl leading-8 text-zinc-300">
        {summary}
      </p>

    </section>
  );
}