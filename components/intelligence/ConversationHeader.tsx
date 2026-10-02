"use client";

import React, { useState } from "react";
import { X, Sparkles, Database, ShieldCheck, ChevronDown } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";

interface ConversationHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  title?: string;
  onRename?: (newTitle: string) => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  activeTab,
  onTabChange,
  title = "Consolidating Claude seat plans",
  onRename
}) => {
  const { setIsOpen } = useConversation();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const tabs = [
    { id: "analysis", label: "Analysis" },
    { id: "reports", label: "Reports" },
    { id: "decisions", label: "Decisions" },
    { id: "insights", label: "Insights" },
    { id: "memory", label: "Memory" },
    { id: "grounding", label: "Grounding" }
  ];

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRename && editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col border-b border-white/5 bg-zinc-950 font-sans">
      {/* Upper Header (Title and Status) */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <form onSubmit={handleRenameSubmit}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    autoFocus
                    className="bg-zinc-900 text-xs font-bold text-white px-2 py-1 rounded border border-white/10 outline-none"
                  />
                </form>
              ) : (
                <h3
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-white flex items-center gap-1 cursor-pointer hover:underline"
                >
                  {title}
                  <ChevronDown className="h-3 w-3 text-zinc-500" />
                </h3>
              )}
            </div>
            <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Analyst Ready
              </span>
              <span>• Mock Provider</span>
              <span>• Acme Inc.</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Ticker Row */}
      <div className="px-4 py-1.5 bg-zinc-900/40 border-y border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
        <span className="flex items-center gap-1 text-zinc-400">
          <Database className="h-2.5 w-2.5 text-lime-400" />
          Memory Connected
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5 text-lime-400" />
          Last Sync: Today 01:00 AM
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-2 pt-1.5 bg-zinc-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 text-center py-2 text-[10px] font-bold tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? "text-white border-lime-400 font-extrabold"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
