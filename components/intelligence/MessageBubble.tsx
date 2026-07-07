"use client";

import React from "react";
import { ChatMessage } from "@/lib/ai/conversation/types";
import { Sparkles, User } from "lucide-react";

export const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isAssistant = message.role === "assistant";

  // Simple, robust custom parser for bold, lists, tables, and paragraphs
  const renderContent = (text: string) => {
    // Check if it's a markdown table
    if (text.includes("|") && text.split("\n").some((l) => l.trim().startsWith("|"))) {
      const lines = text.split("\n").filter((l) => l.trim() !== "");
      const tableRows = lines.filter((l) => l.includes("|"));
      const nonTableText = lines.filter((l) => !l.includes("|")).join("\n");

      // Parse table
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(2); // Skip separator row (---)
      
      const headers = headerRow.split("|").map((h) => h.trim()).filter((h) => h !== "");
      const rows = dataRows.map((r) => r.split("|").map((cell) => cell.trim()).filter((c) => c !== ""));

      return (
        <div className="space-y-3">
          {nonTableText && <div className="text-zinc-300 whitespace-pre-wrap">{parseText(nonTableText)}</div>}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/45 my-2">
            <table className="min-w-full divide-y divide-white/10 text-[11px]">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 whitespace-nowrap">{parseText(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Split text by lines to support bullet points and ordered lists
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        return (
          <ul key={idx} className="list-disc pl-5 text-zinc-300 text-xs my-1 space-y-1">
            <li>{parseText(trimmed.substring(2))}</li>
          </ul>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        return (
          <ol key={idx} className="list-decimal pl-5 text-zinc-300 text-xs my-1 space-y-1">
            <li value={parseInt(match![1])}>{parseText(match![2])}</li>
          </ol>
        );
      }
      return (
        <div key={idx} className="text-zinc-300 text-xs leading-relaxed my-2.5 whitespace-pre-wrap">
          {parseText(line)}
        </div>
      );
    });
  };

  // Replace bold **text** and backticks `code`
  const parseText = (text: string) => {
    let parts: React.ReactNode[] = [text];

    // Bold parser **bold**
    if (text.includes("**")) {
      const newParts: React.ReactNode[] = [];
      const split = text.split("**");
      split.forEach((part, i) => {
        if (i % 2 === 1) {
          newParts.push(<strong key={`b-${i}`} className="font-extrabold text-white">{part}</strong>);
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    }

    // Inline Code parser `code`
    const finalParts: React.ReactNode[] = [];
    parts.forEach((p, pIdx) => {
      if (typeof p === "string" && p.includes("`")) {
        const splitCode = p.split("`");
        splitCode.forEach((part, i) => {
          if (i % 2 === 1) {
            finalParts.push(
              <code key={`c-${pIdx}-${i}`} className="bg-zinc-900 border border-white/10 rounded px-1 py-0.5 text-[10px] font-mono text-lime-400">
                {part}
              </code>
            );
          } else {
            finalParts.push(part);
          }
        });
      } else {
        finalParts.push(p);
      }
    });

    return finalParts;
  };

  // Format time helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className={`flex gap-3.5 max-w-full ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
      )}

      <div className="flex flex-col max-w-[82%] space-y-1.5">
        <div className={`rounded-2xl p-4 shadow-md border text-xs ${
          isAssistant 
            ? "bg-zinc-950/70 border-white/5 text-zinc-300 rounded-tl-sm"
            : "bg-lime-500 text-black border-lime-600 font-medium rounded-tr-sm"
        }`}>
          {isAssistant ? renderContent(message.content) : <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>}
        </div>
        <span className={`text-[9px] text-zinc-500 font-mono tracking-wider ${isAssistant ? "text-left pl-1" : "text-right pr-1"}`}>
          {formatTime(message.created_at)}
        </span>
      </div>

      {!isAssistant && (
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center shrink-0">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
