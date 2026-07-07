"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useConversation } from "@/lib/ai/conversation/hooks/useConversation";
import { ConversationHeader } from "./ConversationHeader";
import { MessageBubble } from "./MessageBubble";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { TypingIndicator } from "./TypingIndicator";

export const ChatPanel = () => {
  const { isOpen, messages, isLoading, sendMessage } = useConversation();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-zinc-950/90 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300">
      <ConversationHeader />

      {/* Message History Viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      {/* Suggested & Input Actions Panel */}
      <div className="p-5 border-t border-white/10 bg-zinc-950/50 space-y-4">
        {messages.length <= 1 && <SuggestedPrompts />}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask StackAudit..."
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
      </div>
    </div>
  );
};
