"use client";

import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";

const IDLE_MESSAGES = [
  "Found new optimization opportunities.",
  "I've finished analyzing your stack.",
  "Want to simulate your hiring plan?",
  "Can we reduce your AI budget?",
  "Need help choosing between Claude and GPT?"
];

export const FloatingOrb = () => {
  const { isOpen, setIsOpen } = useConversation();
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isOpen) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % IDLE_MESSAGES.length);
        setVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Tooltip message */}
      <div 
        className={`bg-zinc-950/90 border border-white/10 rounded-2xl p-3.5 px-4 shadow-xl backdrop-blur-md max-w-xs transition-all duration-500 pointer-events-auto cursor-pointer ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <p className="text-[11px] font-bold text-lime-400 font-mono tracking-wider uppercase">StackAudit Intelligence</p>
        <p className="text-xs font-semibold text-white/90 mt-1 leading-snug">
          {IDLE_MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Floating Orb Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="pointer-events-auto h-14 w-14 rounded-full bg-lime-500 hover:bg-lime-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_25px_rgba(132,204,22,0.55)] transition-all duration-300 relative group active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-lime-500/20 animate-ping group-hover:animate-none"></span>
        <Brain className="h-6 w-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
