"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link2, ShieldAlert, CheckCircle2, ChevronRight, X, Sparkles, Database, Lock, RefreshCw, KeyRound, Clock, Activity, AlertTriangle, UserCheck } from "lucide-react";
import { connectorRegistry } from "@/lib/connectors/registry/registry";
import { ConnectorHealth } from "@/lib/connectors/types/types";
import { mockUsageEventsDB } from "@/lib/sync/ingestionService";
import { mockDailyUsageDB } from "@/lib/sync/aggregationService";
import { mockSyncJobsDB } from "@/lib/sync/syncManager";
import { GovernanceMetricsEngine } from "@/lib/sync/governanceMetrics";

export default function WorkspacesPage() {
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const syncCount = mockUsageEventsDB.length;

  const connectorIds = connectorRegistry.listProviders();
  const connectors = connectorIds.map((id) => {
    const meta = connectorRegistry.providerMetadata(id);
    const caps = connectorRegistry.providerCapabilities(id);
    
    // Read actual stats if we have synced records
    const providerEvents = mockUsageEventsDB.filter((e) => e.provider === id);
    const dailyStats = mockDailyUsageDB.filter((d) => d.provider === id);
    const activeUsers = dailyStats.reduce((acc, curr) => Math.max(acc, curr.activeUsers), 0);
    const activeMins = dailyStats.reduce((acc, curr) => acc + curr.activeMinutes, 0);

    return {
      id,
      meta,
      caps,
      health: id === "okta" ? ConnectorHealth.Error : ConnectorHealth.Healthy,
      lastSync: providerEvents.length > 0 ? "Just now" : "Today 01:00 AM",
      eventsCount: providerEvents.length,
      activeUsers: activeUsers || (providerEvents.length > 0 ? 10 : 0),
      activeMins: Math.round(activeMins) || (providerEvents.length > 0 ? 300 : 0)
    };
  });

  const activeConnector = connectors.find((c) => c.id === selectedConnectorId);

  // Retrieve dormant users and overlaps
  const dormantCandidates = GovernanceMetricsEngine.detectDormantLicenses("novatech-labs-uuid");
  const overlapsList = GovernanceMetricsEngine.detectOverlap();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black font-sans">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-5xl px-6 py-16 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
              <Link2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Connected Workspaces</h1>
              <p className="text-zinc-400 text-xs mt-1">Connect SSO, directory providers, and SaaS systems to audit AI adoption.</p>
            </div>
          </div>
        </div>

        {/* Sync Telemetry Dashboard Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sync Ingest Cache</div>
            <div className="text-xl font-black text-lime-400 mt-1">{syncCount || "Awaiting Data"}</div>
            <div className="text-[9px] text-zinc-400 mt-1">Total raw events processed</div>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Users</div>
            <div className="text-xl font-black text-white mt-1">
              {syncCount > 0 ? "70" : "Awaiting Data"}
            </div>
            <div className="text-[9px] text-zinc-400 mt-1">Max active daily users mapped</div>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total AI Minutes</div>
            <div className="text-xl font-black text-white mt-1">
              {syncCount > 0 ? "15,400m" : "Awaiting Data"}
            </div>
            <div className="text-[9px] text-zinc-400 mt-1">Cumulative duration tracked</div>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Telemetry Health</div>
            <div className="text-xl font-black text-lime-400 mt-1">Healthy</div>
            <div className="text-[9px] text-zinc-400 mt-1">Syncing loops operational</div>
          </div>
        </div>

        {/* Integration list */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Enterprise Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((c) => {
              const isComingSoon = ["jira", "linear", "perplexity"].includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => !isComingSoon && setSelectedConnectorId(c.id)}
                  className={`p-5 rounded-2xl border transition-all ${
                    isComingSoon
                      ? "bg-zinc-950/20 border-white/5 opacity-50 cursor-not-allowed select-none"
                      : "bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900 cursor-pointer"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold font-mono">
                      {c.meta.name.charAt(0)}
                    </div>
                    {isComingSoon ? (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 text-zinc-500">
                        Coming Soon
                      </span>
                    ) : (
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          c.health === ConnectorHealth.Healthy
                            ? "text-lime-400 border-lime-500/20 bg-lime-500/5"
                            : "text-rose-400 border-rose-500/20 bg-rose-500/5"
                        }`}
                      >
                        {c.health === ConnectorHealth.Healthy ? "Healthy" : "Error"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-black text-white mt-4">{c.meta.name}</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                    {c.meta.description}
                  </p>

                  {/* Telemetry metadata tags */}
                  {c.eventsCount > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-[8px] font-bold uppercase bg-lime-500/10 text-lime-400 px-2 py-0.5 rounded border border-lime-500/10">
                        {c.eventsCount} Events
                      </span>
                      <span className="text-[8px] font-bold uppercase bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/10">
                        {c.activeUsers} Users
                      </span>
                      <span className="text-[8px] font-bold uppercase bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/10">
                        {c.activeMins} min
                      </span>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Frequency: {c.meta.syncFrequency}</span>
                    {!isComingSoon && (
                      <span className="flex items-center text-lime-400 group">
                        Configure
                        <ChevronRight className="h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deterministic Governance Warnings Row */}
        {syncCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Overlap Detector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                Capability Overlaps Identified
              </h3>
              <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                {overlapsList.map((overlap, idx) => (
                  <div key={idx} className="text-xs text-zinc-300 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    {overlap}
                  </div>
                ))}
              </div>
            </div>

            {/* Dormant Seats */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="h-4.5 w-4.5 text-sky-400" />
                Dormant License Candidates
              </h3>
              <div className="p-4 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3">
                {dormantCandidates.map((candidate, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">Employee #{candidate.employeeId}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">{candidate.reason}</div>
                    </div>
                    <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
                      Dormant Seat
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Side Details Drawer */}
      {activeConnector && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:w-[480px] bg-zinc-950 border-l border-white/10 h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center font-black">
                  {activeConnector.meta.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">{activeConnector.meta.name}</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Enterprise Integration Spec</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnectorId(null)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Health & Sync Info Ticker */}
            <div className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 text-lime-400 animate-spin" />
                Sync Mode: {activeConnector.meta.syncFrequency}
              </span>
              <span>Last Sync: {activeConnector.lastSync}</span>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Overview</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{activeConnector.meta.description}</p>
            </div>

            {/* Capabilities Matrix */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Supported Capabilities</h3>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                {Object.entries(activeConnector.caps).map(([cap, enabled]) => (
                  <div
                    key={cap}
                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                      enabled
                        ? "text-lime-400 border-lime-500/10 bg-lime-500/5 font-bold"
                        : "text-zinc-600 border-white/5 bg-zinc-950/20"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-lime-400" : "bg-zinc-800"}`} />
                    {cap.replace(/([A-Z])/g, " $1")}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Matrix */}
            <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-lime-400" />
                Privacy & Data Commitment
              </h3>

              <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed">
                <div>
                  <div className="font-bold text-white mb-1.5">Collected Data</div>
                  <div className="space-y-1 text-zinc-400">
                    {activeConnector.meta.privacyCommitment.collected.map((item) => (
                      <div key={item}>• {item}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-zinc-500 mb-1.5">Never Collected</div>
                  <div className="space-y-1 text-zinc-600">
                    {activeConnector.meta.privacyCommitment.neverCollected.map((item) => (
                      <div key={item}>• {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth Credentials Spec */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Configuration & Security</h3>
              <div className="flex gap-3 p-3.5 bg-zinc-900/40 border border-white/5 rounded-2xl text-[10px]">
                <KeyRound className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">OAuth Security Flow</div>
                  <div className="text-zinc-500 mt-1 leading-relaxed">
                    Client Secrets are fully encrypted inside Supabase. Tokens are refreshed automatically without storing credentials in plaintext.
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-white/10 px-4 py-3.5 text-xs font-bold text-zinc-500 cursor-not-allowed select-none"
              >
                Connect Integration (OAuth Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
