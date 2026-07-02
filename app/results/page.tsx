"use client";

import { useState } from "react";
import Link from "next/link";
import { generateSummary } from "@/services/generateSummary";
import { loadResults } from "@/utils/storage";
import type { AuditResult } from "@/types/results";
import Hero from "@/components/results/Hero";
import ExecutiveSummary from "@/components/results/ExecutiveSummary";
import ExecutiveSnapshot from "@/components/results/ExecutiveSnapshot";
import RecommendationHeader from "@/components/results/RecommendationHeader";
import SpendChart from "@/components/results/SpendChart";
import SpendComparison from "@/components/results/SpendComparison";
import RecommendationCard from "@/components/results/RecommendationCard";
import CTA from "@/components/results/CTA";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResultsPage() {
  const [result] = useState<AuditResult | null>(() => {
    const stored = loadResults();

    if (stored) {
      return stored;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const sessionValue = sessionStorage.getItem("audit-result");

    return sessionValue ? (JSON.parse(sessionValue) as AuditResult) : null;
  });

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">No Audit Found</h1>
          <p className="mt-3 text-zinc-400">
            Please generate an audit first.
          </p>

          <Link
            href="/audit"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
          >
            Go Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-16">
        <Hero
          monthly={result.totalMonthlySavings}
          annual={result.totalAnnualSavings}
          score={result.optimizationScore}
        />

        <ExecutiveSummary
          summary={generateSummary(result)}
        />

        <ExecutiveSnapshot result={result} />

        <SpendChart result={result} />

        <SpendComparison
          result={result}
        />

        <div className="mt-14 space-y-6">
          <RecommendationHeader
            totalRecommendations={result.recommendations.length}
            highestSavingTool={result.highestSavingTool}
            highestSavingAmount={result.highestSavingAmount}
          />

          <section className="space-y-6">
            {result.recommendations.map((item, index) => (
              <RecommendationCard
                key={`${item.tool}-${index}`}
                recommendation={item}
              />
            ))}
          </section>
        </div>

        <CTA monthlySavings={result.totalMonthlySavings} />
      </main>

      <Footer />
    </div>
  );
}