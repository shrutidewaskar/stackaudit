"use client";

import React from "react";
import { ArrowRight, Shield, ShoppingCart, Sliders, Lock } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";

export const SuggestedPrompts = () => {
  const { sendMessage } = useConversation();

  const groups = [
    {
      category: "Governance",
      icon: Shield,
      color: "text-lime-400 border-lime-500/10 bg-lime-500/5",
      prompts: [
        { label: "Why is our Governance Score low?", text: "Why is our Governance Score low?" },
        { label: "Which licenses are underutilized?", text: "Which licenses are underutilized?" }
      ]
    },
    {
      category: "Procurement",
      icon: ShoppingCart,
      color: "text-sky-400 border-sky-500/10 bg-sky-500/5",
      prompts: [
        { label: "What should we renew next month?", text: "What should we renew next month?" },
        { label: "Compare Cursor and Copilot pricing", text: "Compare Cursor and GitHub Copilot pricing." }
      ]
    },
    {
      category: "Planning",
      icon: Sliders,
      color: "text-amber-400 border-amber-500/10 bg-amber-500/5",
      prompts: [
        { label: "Forecast team doubling impact", text: "Forecast what happens if our engineering team size doubles next quarter." }
      ]
    },
    {
      category: "Security",
      icon: Lock,
      color: "text-purple-400 border-purple-500/10 bg-purple-500/5",
      prompts: [
        { label: "Identify compliance violations", text: "Are there any connected tools violating compliance and privacy policy?" }
      ]
    }
  ];

  return (
    <div className="space-y-4 w-full text-left font-sans">
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Suggested Analyst Queries</p>
      
      <div className="grid grid-cols-1 gap-4">
        {groups.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.category} className="space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">
                <Icon className="h-3.5 w-3.5 text-zinc-400" />
                {g.category}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.prompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(p.text)}
                    className="text-left p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900 hover:border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{p.label}</span>
                    <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
