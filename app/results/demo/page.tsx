"use client";

import Link from "next/link";
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

      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-10">
        {/* Demo Indicator Banner */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-bold text-amber-300">You are viewing a Demo Audit Report</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Features are view-only. Log in or create an account to run your own stack audits.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/register" 
              className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-[10px] font-bold text-black hover:bg-amber-400 transition-all"
            >
              Sign Up Free
            </Link>
            <Link 
              href="/login" 
              className="rounded-lg border border-white/10 px-3.5 py-1.5 text-[10px] font-bold text-zinc-300 hover:text-white transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
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
