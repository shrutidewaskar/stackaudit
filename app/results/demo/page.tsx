"use client";

import { demoReport } from "@/services/demoReport";
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

export default function DemoResultsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-16">
        <Hero
          monthly={demoReport.totalMonthlySavings}
          annual={demoReport.totalAnnualSavings}
          score={demoReport.optimizationScore}
        />

        <ExecutiveSummary
          summary={demoReport.recommendations[0]?.reason || "No summary available"}
        />

        <ExecutiveSnapshot result={demoReport} />

        <SpendChart result={demoReport} />

        <SpendComparison
          result={demoReport}
        />

        <div className="mt-14 space-y-6">
          <RecommendationHeader
            totalRecommendations={demoReport.recommendations.length}
            highestSavingTool={demoReport.highestSavingTool}
            highestSavingAmount={demoReport.highestSavingAmount}
          />

          <section className="space-y-6">
            {demoReport.recommendations.map((item, index) => (
              <RecommendationCard
                key={`${item.tool}-${index}`}
                recommendation={item}
              />
            ))}
          </section>
        </div>

        <CTA monthlySavings={demoReport.totalMonthlySavings} auditId="demo" />
      </main>

      <Footer />
    </div>
  );
}
