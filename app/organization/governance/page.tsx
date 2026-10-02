"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, ShieldAlert, CheckCircle2, ChevronRight, X, AlertTriangle, UserCheck, TrendingUp, Info, Activity, Clock, ShieldCheck, Download, Calendar, ArrowRight } from "lucide-react";
import { GovernanceEngine } from "@/lib/governance/engine";
import { GovernanceFinding, GovernanceScoreBreakdown } from "@/lib/governance/types";
import { DigestService } from "@/lib/governance/continuous/digestService";

export default function GovernancePage() {
  const orgId = "novatech-labs-uuid";

  const [selectedFinding, setSelectedFinding] = useState<GovernanceFinding | null>(null);
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "json" | null>(null);

  // Read scores and findings deterministically on render
  const scoreBreakdown = GovernanceEngine.calculateScore(orgId);
  const findings = GovernanceEngine.generateFindings(orgId);

  // Mock trend difference calculation (+7 overall score growth)
  const trendDiff = {
    overall: 7,
    visibility: 5,
    utilization: 5,
    adoption: 5,
    redundancy: 5,
    dataCompleteness: 5
  };

  const handleExport = (format: "csv" | "json") => {
    // Basic download link handler
    const content = format === "json" 
      ? JSON.stringify({ scoreBreakdown, findings, date: new Date().toISOString() }, null, 2)
      : `Dimension,Score\nVisibility,${scoreBreakdown.dimensions.visibility.score}\nUtilization,${scoreBreakdown.dimensions.utilization.score}\nAdoption,${scoreBreakdown.dimensions.adoption.score}\nRedundancy,${scoreBreakdown.dimensions.redundancy.score}\nCompleteness,${scoreBreakdown.dimensions.dataCompleteness.score}`;
    
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `governance-report-${new Date().toISOString().substring(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black font-sans">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-5xl px-6 py-16 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Governance Intelligence Center</h1>
              <p className="text-zinc-400 text-xs mt-1">Audit active organization risk profiles, redundant licenses, and cost leakages.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleExport("json")}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              JSON Export
            </button>
            <button 
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              CSV Export
            </button>
          </div>
        </div>

        {/* Governance Score Summary Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-lime-500/5 rounded-full blur-2xl" />
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">StackAudit Governance Score</div>
              <div className="text-5xl font-black text-lime-400 mt-2">{scoreBreakdown.overallScore}</div>
              <div className="flex gap-2 items-center mt-2.5">
                <span className="text-[9px] font-black uppercase bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2 py-0.5 rounded">
                  Data Coverage: 87%
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-3 flex items-center gap-1 font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                +{trendDiff?.overall} points since July 2026 snapshot
              </div>
            </div>
          </div>

          {/* Dimension scores */}
          <div className="md:col-span-2 p-6 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dimension Scores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(scoreBreakdown.dimensions).map(([key, dim]: [string, any]) => (
                <div key={key} className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-white font-black">{dim.score}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-lime-400 h-full transition-all duration-500"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1 leading-snug">{dim.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continuous Governance Digests & Reports Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly digest banner */}
          <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-lime-400" />
              Weekly Governance Digest
            </h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Score increased by **+7 points** this week. Tracked 1 new high-priority dormant seat candidate in engineering.
            </p>
            <button 
              onClick={() => setShowWeeklyDigest(!showWeeklyDigest)}
              className="text-[10px] font-bold text-lime-400 flex items-center gap-1 hover:underline"
            >
              Toggle Digest Summary
              <ArrowRight className="h-3 w-3" />
            </button>

            {showWeeklyDigest && (
              <div className="mt-3 p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-2 text-[10px] text-zinc-300">
                <div>• **Top growing tools**: Cursor (+15% adoption)</div>
                <div>• **Connector Status**: Okta & Google Workspace Healthy</div>
                <div>• **Action candidates linked**: 9 active review opportunities</div>
              </div>
            )}
          </div>

          {/* Monthly Executive overview */}
          <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-sky-400" />
              Latest Monthly Report
            </h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              August 2026 Executive Report is compiled. Contains comprehensive licensing details across all 120 users.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport("json")}
                className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white transition-all"
              >
                Download Report (JSON)
              </button>
              <button 
                onClick={() => handleExport("csv")}
                className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white transition-all"
              >
                Download (CSV)
              </button>
            </div>
          </div>
        </div>

        {/* Governance Findings list */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Identified Action Candidates</h3>
          <div className="grid grid-cols-1 gap-3">
            {findings.map((f) => {
              const isHigh = f.severity === "HIGH";
              const isMed = f.severity === "MEDIUM";
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFinding(f)}
                  className="p-4 bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                          isHigh
                            ? "text-rose-400 border-rose-500/20 bg-rose-500/5"
                            : isMed
                            ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
                            : "text-sky-400 border-sky-500/20 bg-sky-500/5"
                        }`}
                      >
                        {f.severity}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-none">{f.title}</h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 max-w-2xl leading-relaxed">{f.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-lime-400 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Review Opportunity
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detail side drawer */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:w-[480px] bg-zinc-950 border-l border-white/10 h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 animate-slide-in">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center font-black">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">{selectedFinding.title}</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Rule ID: {selectedFinding.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Severity and confidence status */}
            <div className="flex gap-2">
              <span className="text-[8px] font-black uppercase bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-full text-zinc-400">
                Confidence: {Math.round(selectedFinding.confidence * 100)}%
              </span>
              <span className="text-[8px] font-black uppercase bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-full text-zinc-400">
                Status: {selectedFinding.status}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Finding details</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedFinding.description}</p>
            </div>

            {/* Evidence details system (explainable) */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-3.5">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Info className="h-4 w-4 text-lime-400" />
                Audit Evidence Data
              </h3>
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                {Object.entries(selectedFinding.evidence).map(([key, val]: [string, any]) => (
                  <div key={key}>
                    <div className="text-zinc-500 font-bold uppercase">{key.replace(/([A-Z])/g, " $1")}</div>
                    <div className="text-white font-bold mt-0.5">{Array.isArray(val) ? val.join(", ") : String(val)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action candidates */}
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Suggested Action Candidate</h3>
              <div className="flex gap-3 p-3.5 bg-lime-500/5 border border-lime-500/10 rounded-2xl text-[10px]">
                <ShieldCheck className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider">{selectedFinding.recommendedAction.replace(/_/g, " ")}</div>
                  <div className="text-zinc-500 mt-1 leading-relaxed">
                    This deterministic action is queued for procurement/admin team review. Take action below to complete review.
                  </div>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button className="flex-1 py-3 text-xs font-bold text-center bg-lime-400 hover:bg-lime-300 text-black rounded-xl transition-all">
                Approve Action Candidate
              </button>
              <button
                onClick={() => setSelectedFinding(null)}
                className="py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
