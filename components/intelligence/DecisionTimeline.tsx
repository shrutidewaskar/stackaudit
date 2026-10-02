"use client";

import React from "react";
import { GitCommit, CheckCircle2, AlertCircle } from "lucide-react";

export const DecisionTimeline: React.FC = () => {
  const events = [
    {
      date: "Today",
      title: "Reduce 12 Cursor Licenses",
      status: "Pending Approval",
      desc: "Flagged redundant seats matching inactive developer profiles.",
      isPending: true
    },
    {
      date: "July 24, 2026",
      title: "Consolidated Copilot & Cursor Plus",
      status: "Accepted & Applied",
      desc: "Approved downgrade of 8 redundant Copilot developer seats.",
      isAccepted: true
    },
    {
      date: "June 12, 2026",
      title: "Downgraded ChatGPT Enterprise Tier",
      status: "Implemented",
      desc: "Migrated 24 users from ChatGPT Enterprise to Plus model standard seats.",
      isImplemented: true
    }
  ];

  return (
    <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-4">
      <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
        Decision Memory Timeline
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
        {events.map((e, idx) => (
          <div key={idx} className="relative space-y-1">
            {/* Status node icon */}
            <span className="absolute -left-[23px] top-0.5 bg-zinc-950 p-0.5 rounded-full z-10">
              {e.isPending && <AlertCircle className="h-4 w-4 text-amber-500" />}
              {e.isAccepted && <CheckCircle2 className="h-4 w-4 text-sky-400" />}
              {e.isImplemented && <GitCommit className="h-4 w-4 text-lime-400" />}
            </span>

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{e.date}</span>
              <span
                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  e.isPending
                    ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                    : e.isAccepted
                    ? "text-sky-400 border-sky-500/20 bg-sky-500/5"
                    : "text-lime-400 border-lime-500/20 bg-lime-500/5"
                }`}
              >
                {e.status}
              </span>
            </div>

            <div className="text-xs font-semibold text-white">{e.title}</div>
            <div className="text-[10px] text-zinc-400 leading-relaxed">{e.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
