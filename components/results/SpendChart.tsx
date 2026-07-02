"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AuditResult } from "@/types/results";
import { formatCurrency } from "@/rules/helpers";

interface Props {
  result: AuditResult;
}

export default function SpendChart({ result }: Props) {
  const [activeTab, setActiveTab] = useState<"summary" | "tools">("summary");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Summary data
  const summaryData = [
    {
      name: "AI Stack Total",
      "Current Spend": result.totalCurrentMonthlySpend,
      "Optimized Spend": result.totalOptimizedMonthlySpend,
      "Net Savings": result.totalMonthlySavings,
    },
  ];

  // Per-tool breakdown data
  const toolData = result.recommendations.map((rec) => {
    const currentSpend = rec.monthlySpend ?? (rec.monthlySavings > 0 ? rec.monthlySavings + 20 : 20); // fallback
    const optimizedSpend = Math.max(0, currentSpend - rec.monthlySavings);
    
    return {
      name: rec.tool,
      "Current Spend": currentSpend,
      "Optimized Spend": optimizedSpend,
      Savings: rec.monthlySavings,
    };
  });

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.24)] backdrop-blur-sm md:p-8">
      {/* Chart Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
            Visual Analytics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Spend Analysis Dashboard
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1.5 rounded-xl bg-zinc-950 p-1 border border-white/5 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "summary"
                ? "bg-white text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Stack Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "tools"
                ? "bg-white text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Per-Tool Breakdown
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="h-[340px] w-full mt-6">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "summary" ? (
              <BarChart data={summaryData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    background: "rgba(9, 9, 11, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Current Spend" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Optimized Spend" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Net Savings" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            ) : (
              <BarChart data={toolData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    background: "rgba(9, 9, 11, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Current Spend" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized Spend" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500 font-mono border border-dashed border-white/5 rounded-2xl bg-zinc-950/20">
            Loading Spend Analytics...
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-500 text-center leading-normal">
        {activeTab === "summary"
          ? "Summary views allow quick assessment of top-line cost-reduction opportunities across subscription budgets."
          : "Review the direct delta per tool subscription to prioritize seat downgrades and account cancellations."}
      </p>
    </section>
  );
}