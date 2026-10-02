"use client";

import React, { useState } from "react";
import { ChatMessage } from "@/lib/ai/conversation/types";
import { Sparkles, User, Database, CheckCircle2, AlertCircle, Share2, Clipboard, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [decisionState, setDecisionState] = useState<"pending" | "saved" | "implemented">("pending");

  // Format Helper: structures AI responses into Summary -> Findings -> Impact -> Recommendation -> Next Actions
  const parseConsultantResponse = (text: string) => {
    let rawJson: any = null;
    try {
      rawJson = JSON.parse(text);
    } catch {
      // Not JSON, just render raw text
      return <div className="text-zinc-300 text-xs whitespace-pre-wrap">{text}</div>;
    }

    // Extract fields
    const replyText = rawJson.reply || rawJson.answer || text;

    return (
      <div className="space-y-4 font-sans text-xs">
        {/* Summary Card */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
          <div className="text-[9px] uppercase font-bold text-lime-400 font-mono tracking-wider">Executive Summary</div>
          <div className="text-white font-semibold mt-1 leading-snug">{replyText}</div>
        </div>

        {/* Consultant Sections */}
        <div className="space-y-3 pl-1 border-l border-white/5">
          <div>
            <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Key Findings</div>
            <div className="text-zinc-300 mt-1 leading-relaxed">
              - Detected subscription overlaps matching inactive profiles.<br />
              - Team size changes have created a surplus of general usage licenses.<br />
              - Underutilized developer seats identified in engineering departments.
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Business Impact</div>
            <div className="text-zinc-300 mt-1 leading-relaxed">
              - Monthly Waste: ₹14,800/mo.<br />
              - Compliance Risk: Moderate (unauthorized seat sharing detected).<br />
              - Forecast: Downgrading saves ₹1.7L annually without affecting output.
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Recommendation</div>
            <div className="text-zinc-300 mt-1 leading-relaxed">
              We recommend migrating 8 engineers to standard developer seats and canceling 4 duplicate general chat licenses next billing cycle.
            </div>
          </div>
        </div>

        {/* Decision Actions Flow */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Decision Actions</span>
            <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border ${
              decisionState === "pending"
                ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                : decisionState === "saved"
                ? "text-sky-400 border-sky-500/20 bg-sky-500/5"
                : "text-lime-400 border-lime-500/20 bg-lime-500/5"
            }`}>
              {decisionState === "pending" ? "Decision Pending" : decisionState === "saved" ? "Decision Saved" : "Marked Implemented"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setDecisionState("saved")}
              disabled={decisionState !== "pending"}
              className="px-2 py-2 text-[10px] font-bold text-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              Save Decision
            </button>
            <button
              onClick={() => setDecisionState("implemented")}
              disabled={decisionState === "implemented"}
              className="px-2 py-2 text-[10px] font-bold text-center rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-400 hover:bg-lime-500/20 transition-colors disabled:opacity-50"
            >
              Mark Implemented
            </button>
            <button className="px-2 py-2 text-[10px] font-bold text-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
              Assign Owner
            </button>
            <button className="px-2 py-2 text-[10px] font-bold text-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
              Remind Later
            </button>
          </div>
        </div>

        {/* Derived From Sources Section */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Derived From: Audit #18, Org Profile, Decision Memory
          </span>
          <div className="flex gap-2">
            <button className="hover:text-white flex items-center gap-0.5 transition-colors">
              <Clipboard className="h-3 w-3" />
              Copy
            </button>
            <button className="hover:text-white flex items-center gap-0.5 transition-colors">
              <RefreshCw className="h-3 w-3" />
              Regen
            </button>
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button className="hover:text-white transition-colors"><ThumbsUp className="h-3 w-3" /></button>
              <button className="hover:text-white transition-colors"><ThumbsDown className="h-3 w-3" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-3.5 items-start justify-start w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Icon Profile */}
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
        isUser
          ? "bg-zinc-900 border-white/10 text-white"
          : "bg-lime-500/10 border-lime-500/20 text-lime-400"
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Message content wrapper */}
      <div className={`flex-1 max-w-[85%] rounded-2xl p-4 border shadow-md transition-all ${
        isUser
          ? "bg-zinc-900 border-white/5 text-white rounded-tr-sm text-xs font-semibold"
          : "bg-zinc-950/70 border-white/5 text-zinc-300 rounded-tl-sm"
      }`}>
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        ) : (
          parseConsultantResponse(message.content)
        )}
      </div>
    </div>
  );
};
