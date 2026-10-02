"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit } from "lucide-react";

export const TypingIndicator = () => {
  const steps = [
    "Understanding Question",
    "Loading Organization",
    "Checking Rules",
    "Retrieving Decisions",
    "Preparing Context",
    "Generating Insight"
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 items-start justify-start font-sans">
      <div className="h-8 w-8 rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4" />
      </div>
      
      <div className="rounded-2xl p-4 bg-zinc-950/70 border border-white/5 space-y-3 rounded-tl-sm max-w-sm">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4.5 w-4.5 text-lime-400 animate-pulse shrink-0" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Analyst Thinking Process
          </span>
        </div>

        {/* Reasoning Steps visualizer */}
        <div className="flex flex-col gap-1.5 pl-1.5 border-l border-white/10">
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            return (
              <div
                key={idx}
                className={`text-[10px] font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? "text-lime-400 scale-[1.02] origin-left"
                    : isCompleted
                    ? "text-zinc-500"
                    : "text-zinc-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive
                      ? "bg-lime-400 animate-ping"
                      : isCompleted
                      ? "bg-zinc-600"
                      : "bg-zinc-800"
                  }`}
                />
                {step}
              </div>
            );
          })}
        </div>

        {/* Traditional loading dots */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
          <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="h-1 w-1 rounded-full bg-zinc-500 animate-bounce"></span>
          <span className="text-[9px] text-zinc-500 font-bold ml-1 uppercase">Working...</span>
        </div>
      </div>
    </div>
  );
};
