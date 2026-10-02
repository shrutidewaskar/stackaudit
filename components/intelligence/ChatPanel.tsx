"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, FileText, Download, Share2, Eye, Brain } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";
import { ConversationHeader } from "./ConversationHeader";
import { MessageBubble } from "./MessageBubble";
import { ConversationEmptyState } from "./ConversationEmptyState";
import { TypingIndicator } from "./TypingIndicator";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { GovernanceCard } from "./GovernanceCard";
import { DecisionTimeline } from "./DecisionTimeline";

export const ChatPanel = () => {
  const { isOpen, setIsOpen, messages, isLoading, sendMessage } = useConversation();
  const [activeTab, setActiveTab] = useState("analysis");
  const [showSidebar, setShowSidebar] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcuts (Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex h-full font-sans shadow-2xl bg-zinc-950 border-l border-white/5 animate-slide-in">
      {/* Dynamic Workspace Sidebar (Toggleable) */}
      {showSidebar && (
        <WorkspaceSidebar
          onSelectSession={(id) => console.log("Select session:", id)}
          onNewAnalysis={() => console.log("New Analysis")}
          activeSessionId="session-1"
        />
      )}

      {/* Main Drawer Body */}
      <div className="w-full sm:w-[480px] flex flex-col h-full bg-zinc-950 text-white select-none">
        {/* Workspace Header */}
        <ConversationHeader
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          title="Consolidating Claude seat plans"
        />

        {/* Dynamic Inner Tab Viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "analysis" && (
            <div className="space-y-6">
              {/* Message History Viewport */}
              {messages.length === 0 ? (
                <ConversationEmptyState />
              ) : (
                <div className="space-y-6">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={scrollRef} />
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Q3 Stack Audit Executive Summary</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Compiled Today 01:00 AM • PDF Format</p>
                  </div>
                </div>
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
                  **Preview Analysis:** StackAudit verified a total savings potential of ₹1,82,500/mo. through de-duplication of Cursor Pro & Claude Team subscription lists. Click below to view the full PDF layout report.
                </div>
                <div className="flex gap-2.5">
                  <button className="flex-1 py-2 text-[10px] font-bold text-center bg-white hover:bg-zinc-200 text-black rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Preview Report
                  </button>
                  <button className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors">
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "decisions" && <DecisionTimeline />}

          {activeTab === "insights" && (
            <div className="space-y-4">
              <GovernanceCard />
            </div>
          )}

          {activeTab === "memory" && (
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-4">
              <div>
                <div className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Connected Entities Index</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Cursor", "Claude", "Copilot", "Engineering", "Acme Inc.", "Procurement"].map((ent) => (
                    <span key={ent} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-semibold text-zinc-300">
                      {ent}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase font-black text-zinc-500 tracking-wider font-mono">Topics Catalog</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["License Optimization", "Budget Allocation", "Contract Renewal", "Tool Consolidation"].map((topic) => (
                    <span key={topic} className="px-2.5 py-1 bg-lime-500/10 border border-lime-500/10 rounded-full text-[10px] font-bold text-lime-400">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "grounding" && (
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-4">
              <div>
                <div className="text-[10px] font-black text-lime-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="h-4.5 w-4.5 text-lime-400 animate-pulse" />
                  AI Context Grounding Inspector
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Inspect the structured grounding payload created for future LLM reasoning requests.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/5 space-y-3 text-[10px]">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-zinc-500 font-bold uppercase">Detected Intent</span>
                  <span className="font-mono text-lime-400 font-black">GOVERNANCE_EXPLANATION</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-zinc-500 font-bold uppercase">Context Token Size</span>
                  <span className="text-white font-bold">1.8 KB</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-zinc-500 font-bold uppercase">Data Coverage</span>
                  <span className="text-white font-bold">87%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-zinc-500 font-bold uppercase">Privacy Compliance</span>
                  <span className="text-lime-400 font-black">Strict Redaction Active</span>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-xl border border-white/5 space-y-2">
                <div className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Traceable Source Citations</div>
                <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  • snap-novatech-labs-uuid-latest<br />
                  • finding-dormant-emp-5<br />
                  • report-weekly-latest
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar toggler & Prompt Actions Panel */}
        <div className="p-4 border-t border-white/5 bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between gap-4">
            {/* Quick Navigation Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[80%] scrollbar-none">
              {["Renewals", "Procurement", "Forecast", "Departments", "Marketplace"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(`Show ${chip.toLowerCase()} analysis`)}
                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Sidebar toggle button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
            >
              {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            </button>
          </div>

          {/* Form Input bar */}
          {activeTab === "analysis" && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Analyze organization stack..."
                disabled={isLoading}
                className="flex-1 rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 disabled:opacity-50 transition-all font-semibold"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-lime-500 hover:bg-lime-400 text-black flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
