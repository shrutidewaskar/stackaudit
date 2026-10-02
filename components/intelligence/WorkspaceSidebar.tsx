"use client";

import React, { useState } from "react";
import { Search, Plus, Pin, Star, FileText, CheckCircle2, History } from "lucide-react";

interface WorkspaceSidebarProps {
  onSelectSession: (id: string) => void;
  onNewAnalysis: () => void;
  activeSessionId: string | null;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  onSelectSession,
  onNewAnalysis,
  activeSessionId
}) => {
  const [search, setSearch] = useState("");

  const sessions = [
    { id: "session-1", title: "Consolidating Claude seat plans", time: "Today", isPinned: true, isFavorite: false },
    { id: "session-2", title: "Cursor Pro team configuration", time: "Yesterday", isPinned: false, isFavorite: true },
    { id: "session-3", title: "Renewing GitHub Copilot early", time: "This Week", isPinned: false, isFavorite: false },
    { id: "session-4", title: "Notion AI License Audit Q3", time: "This Week", isPinned: true, isFavorite: false }
  ];

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col h-full text-zinc-400 text-xs">
      {/* New Analysis Button */}
      <div className="p-4">
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 px-4 py-3 font-bold text-black transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </button>
      </div>

      {/* Search Field */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search governance..."
            className="w-full rounded-xl bg-zinc-900 border border-white/5 pl-9 pr-3 py-2 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/10"
          />
        </div>
      </div>

      {/* Sidebar Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* Pinned Analyses */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Pin className="h-3 w-3" />
            Pinned Sessions
          </div>
          <div className="space-y-0.5">
            {filteredSessions.filter((s) => s.isPinned).map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  activeSessionId === s.id
                    ? "bg-zinc-900 text-white font-semibold"
                    : "hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <span className="truncate">{s.title}</span>
                <Star className="h-3 w-3 text-lime-400 fill-lime-400" />
              </button>
            ))}
          </div>
        </div>

        {/* History Categories */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <History className="h-3 w-3" />
            Previous Governance Sessions
          </div>
          <div className="space-y-0.5">
            {filteredSessions.filter((s) => !s.isPinned).map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  activeSessionId === s.id
                    ? "bg-zinc-900 text-white font-semibold"
                    : "hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <span className="truncate">{s.title}</span>
                <span className="text-[10px] text-zinc-600 shrink-0">{s.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Decisions */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <CheckCircle2 className="h-3 w-3" />
            Saved Decisions
          </div>
          <div className="space-y-0.5">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900/50 hover:text-zinc-200 transition-colors truncate">
              ✓ Cursor Seat Reduction
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900/50 hover:text-zinc-200 transition-colors truncate">
              ✓ Claude Pro Consolidation
            </button>
          </div>
        </div>

        {/* Executive Reports */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <FileText className="h-3 w-3" />
            Executive Reports
          </div>
          <div className="space-y-0.5">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900/50 hover:text-zinc-200 transition-colors truncate">
              📄 Q2 Stack Audit Report
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900/50 hover:text-zinc-200 transition-colors truncate">
              📄 Annual AI Budget Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
