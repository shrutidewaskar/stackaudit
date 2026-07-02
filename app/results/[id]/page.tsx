"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAudit } from "@/lib/database";
import type { AuditTool } from "@/types/database";
import type { AuditResult, Recommendation } from "@/types/results";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultsPage({ params }: PageProps) {
  const [auditData, setAuditData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadAuditData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        if (!mounted) return;
        setAuditId(id);

        const { audit, tools, error: dbError } = await getAudit(id);

        if (dbError || !audit) {
          if (mounted) {
            setError(dbError || "Audit not found");
            setLoading(false);
          }
          return;
        }

        // Transform database records into AuditResult
        const optimizationScoreMap: Record<string, "Excellent" | "Good" | "Fair" | "Poor"> = {
          "Excellent": "Excellent",
          "Good": "Good",
          "Fair": "Fair",
          "Poor": "Poor",
        };

        const scoreLabel = (optimizationScoreMap[audit.optimization_score] || "Good") as "Excellent" | "Good" | "Fair" | "Poor";
        
        const toneMap: Record<"Excellent" | "Good" | "Fair" | "Poor", "excellent" | "good" | "fair" | "poor"> = {
          "Excellent": "excellent",
          "Good": "good",
          "Fair": "fair",
          "Poor": "poor",
        };

        const recommendations: Recommendation[] = tools.map((tool: AuditTool) => ({
          tool: tool.tool,
          currentPlan: tool.current_plan,
          recommendedPlan: tool.recommended_plan,
          monthlySavings: tool.monthly_savings,
          annualSavings: tool.monthly_savings * 12,
          reason: tool.reason,
          severity: (tool.severity as "High" | "Medium" | "Low") || "Medium",
          monthlySpend: tool.monthly_spend,
        }));

        const highestSavingTool = recommendations.reduce(
          (max, rec) => (rec.monthlySavings > max.monthlySavings ? rec : max),
          recommendations[0] || { tool: "", monthlySavings: 0 }
        );

        const result: AuditResult = {
          totalCurrentMonthlySpend: audit.total_current_monthly_spend,
          totalOptimizedMonthlySpend: audit.total_optimized_monthly_spend,
          totalMonthlySavings: audit.total_monthly_savings,
          totalAnnualSavings: audit.total_annual_savings,
          percentageSaved: audit.percentage_saved,
          optimizationScore: {
            label: scoreLabel,
            tone: toneMap[scoreLabel],
            description: `Your AI stack optimization score is ${scoreLabel}`,
          },
          highestSavingTool: highestSavingTool.tool,
          highestSavingAmount: highestSavingTool.monthlySavings,
          recommendations,
        };

        if (mounted) {
          setAuditData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load audit");
          setLoading(false);
        }
      }
    }

    loadAuditData();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p className="text-zinc-400">Loading your audit report...</p>
        </div>
      </main>
    );
  }

  if (error || !auditData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Audit Not Found</h1>
          <p className="mt-3 text-zinc-400">
            {error || "The audit you're looking for doesn't exist or has expired."}
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
          monthly={auditData.totalMonthlySavings}
          annual={auditData.totalAnnualSavings}
          score={auditData.optimizationScore}
        />

        <ExecutiveSummary
          summary={auditData.recommendations[0]?.reason || "No summary available"}
        />

        <ExecutiveSnapshot result={auditData} />

        <SpendChart result={auditData} />

        <SpendComparison
          result={auditData}
        />

        <div className="mt-14 space-y-6">
          <RecommendationHeader
            totalRecommendations={auditData.recommendations.length}
            highestSavingTool={auditData.highestSavingTool}
            highestSavingAmount={auditData.highestSavingAmount}
          />

          <section className="space-y-6">
            {auditData.recommendations.map((item, index) => (
              <RecommendationCard
                key={`${item.tool}-${index}`}
                recommendation={item}
              />
            ))}
          </section>
        </div>

        <CTA monthlySavings={auditData.totalMonthlySavings} auditId={auditId} />
      </main>

      <Footer />
    </div>
  );
}
