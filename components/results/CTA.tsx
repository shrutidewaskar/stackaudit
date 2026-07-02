"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/results/ReportDialog";

interface Props {
  monthlySavings: number;
  auditId?: string;
}

export default function CTA({ monthlySavings, auditId }: Props) {
  const [open, setOpen] = useState(false);

  const config = useMemo(() => {
    if (monthlySavings > 500) {
      return {
        title: "Book a Credex Consultation",
        description:
          "You have an enterprise-scale optimization opportunity. We can help you reduce spend without disrupting team workflows.",
        button: "Book a Credex Consultation",
      };
    }

    if (monthlySavings >= 100) {
      return {
        title: "Save My Report",
        description:
          "Capture this audit for later and keep the recommendations handy for your team.",
        button: "Save My Report",
      };
    }

    return {
      title: "You're already spending efficiently.",
      description:
        "Leave your email and we’ll notify you if a future audit uncovers more savings.",
      button: "Get Email Updates",
    };
  }, [monthlySavings]);

  return (
    <>
      <section className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-8 text-center shadow-[0_22px_80px_rgba(0,0,0,0.22)] md:p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Next Step
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          {config.title}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          {config.description}
        </p>

        <Button
          type="button"
          className="mt-8 h-11 rounded-xl bg-white px-8 text-black hover:bg-zinc-200"
          onClick={() => setOpen(true)}
        >
          {config.button}
        </Button>
      </section>

      <ReportDialog
        open={open}
        onOpenChange={setOpen}
        headline={config.title}
        description={config.description}
        auditId={auditId}
      />
    </>
  );
}