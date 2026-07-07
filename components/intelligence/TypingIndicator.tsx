"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3.5 items-center justify-start">
      <div className="h-8 w-8 rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="rounded-2xl p-4 bg-zinc-950/70 border border-white/5 flex items-center gap-1.5 rounded-tl-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
      </div>
    </div>
  );
};
