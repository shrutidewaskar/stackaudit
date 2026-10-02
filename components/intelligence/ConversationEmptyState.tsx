"use client";

import React from "react";
import { Sparkles, AlertTriangle, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { SuggestedPrompts } from "./SuggestedPrompts";

export const ConversationEmptyState = () => {
  const alerts = [
    { label: "8 inactive licenses detected", desc: "Unassigned seats costing ₹12,400/mo.", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
    { label: "Claude renewal due in 12 days", desc: "Contract expires soon; review required.", icon: Calendar, color: "text-sky-400 bg-sky-400/5 border-sky-400/10" },
    { label: "Governance Score improved 4%", desc: "De-duplication policies applied last week.", icon: TrendingUp, color: "text-lime-400 bg-lime-400/5 border-lime-400/10" },
    { label: "₹2.1L projected annual savings", desc: "Identified via stack optimization tools.", icon: DollarSign, color: "text-purple-400 bg-purple-400/5 border-purple-400/10" }
  ];

  return (
    <div className="flex flex-col p-6 py-8 space-y-6 font-sans text-left">
      {/* Personalized Greeting */}
      <div className="space-y-2">
        <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-lime-400 animate-pulse" />
          Good morning, Shruti
        </h4>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Your Governance Score improved 6% this week. One renewal requires attention. What would you like to analyze today?
        </p>
      </div>

      {/* Today's Intelligence Feed */}
      <div className="space-y-3">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Today's Intelligence</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alerts.map((a, idx) => {
            const Icon = a.icon;
            return (
              <div key={idx} className={`p-3 rounded-2xl border flex gap-3 ${a.color}`}>
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{a.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-snug">{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompts Section */}
      <div className="pt-2">
        <SuggestedPrompts />
      </div>
    </div>
  );
};
