"use client";

import React from "react";
import { ShieldCheck, Eye, Activity, Scale, Milestone } from "lucide-react";

export const GovernanceCard: React.FC = () => {
  const metrics = [
    { name: "Overall Score", value: 83, icon: ShieldCheck, color: "text-lime-400 border-lime-500/20 bg-lime-500/5" },
    { name: "Visibility", value: 91, icon: Eye, color: "text-sky-400 border-sky-500/20 bg-sky-500/5" },
    { name: "Utilization", value: 74, icon: Activity, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
    { name: "Compliance", value: 89, icon: Scale, color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
    { name: "Planning", value: 62, icon: Milestone, color: "text-rose-400 border-rose-500/20 bg-rose-500/5" }
  ];

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3">
      <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
        AI Governance Scorecard
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className={`flex items-center gap-3 border rounded-xl p-2.5 ${m.color}`}>
              <Icon className="h-4 w-4 shrink-0" />
              <div>
                <div className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">{m.name}</div>
                <div className="text-sm font-black">{m.value}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
