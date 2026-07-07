"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { SuggestedPrompts } from "./SuggestedPrompts";

export const ConversationEmptyState = () => {
  return (
    <div className="flex flex-col items-center text-center justify-center p-6 py-12 space-y-6">
      <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
        <Sparkles className="h-6 w-6 animate-pulse" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">Let's Optimize Your Stack</h4>
        <p className="text-zinc-400 text-xs mt-2 max-w-xs leading-relaxed">
          I am prepared to answer comparisons, forecast hiring adjustments, or downscale seats. Select a prompt below or type your question.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <SuggestedPrompts />
      </div>
    </div>
  );
};
