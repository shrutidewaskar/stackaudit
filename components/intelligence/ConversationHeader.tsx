"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";

export const ConversationHeader = () => {
  const { setIsOpen } = useConversation();

  return (
    <div className="flex items-center justify-between border-b border-white/10 p-5 bg-zinc-950/70 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">StackAudit Intelligence</h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Helping you make better AI decisions.</p>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(false)}
        className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
