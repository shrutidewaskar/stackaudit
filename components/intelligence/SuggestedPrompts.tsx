"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";

export const SuggestedPrompts = () => {
  const { suggestions, sendMessage } = useConversation();

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="space-y-2.5 w-full">
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-left pl-1">Suggested Discussions</p>
      <div className="flex flex-col gap-2">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(sug.prompt)}
            className="w-full text-left p-3 rounded-xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-lime-500/20 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
          >
            <span>{sug.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
