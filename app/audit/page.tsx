"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuditHeader from "@/components/audit/AuditHeader";
import TeamInfo from "@/components/audit/TeamInfo";
import ToolCard from "@/components/audit/ToolCard";
import { runAudit } from "@/rules/auditEngine";
import { loadAudit, saveAudit, saveResults } from "@/utils/storage";
import { supabase } from "@/lib/supabase";

import { AuditFormData, ToolEntry } from "@/types/audit";

function createBlankAudit(): AuditFormData {
  return {
    teamSize: 1,
    useCase: "Coding",
    tools: [
      {
        id: "tool-1",
        tool: "",
        plan: "",
        monthlySpend: 0,
        seats: 1,
      },
    ],
  };
}

export default function AuditPage() {
  const [audit, setAudit] = useState<AuditFormData>(() => loadAudit() ?? createBlankAudit());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState("Ready to analyze your AI stack.");

  useEffect(() => {
    saveAudit(audit);
  }, [audit]);

  function updateTool(updatedTool: ToolEntry) {
    setAudit({
      ...audit,
      tools: audit.tools.map((tool) =>
        tool.id === updatedTool.id ? updatedTool : tool
      ),
    });
  }

  function addTool() {
    setAudit({
      ...audit,
      tools: [
        ...audit.tools,
        {
          id: crypto.randomUUID(),
          tool: "",
          plan: "",
          monthlySpend: 0,
          seats: 1,
        },
      ],
    });
  }

  function removeTool(id: string) {
    if (audit.tools.length === 1) return;

    setAudit({
      ...audit,
      tools: audit.tools.filter((tool) => tool.id !== id),
    });
  }

  async function generateAudit() {
    setIsGenerating(true);

    const messages = [
      "Analyzing your AI stack...",
      "Checking current plans...",
      "Comparing competitors...",
      "Calculating savings...",
      "Generating recommendations...",
      "Preparing report...",
    ];

    let index = 0;
    setProgressMessage(messages[index]);

    const interval = window.setInterval(async () => {
      index += 1;
      if (index < messages.length) {
        setProgressMessage(messages[index]);
        return;
      }

      window.clearInterval(interval);
      
      try {
        const result = runAudit(audit);
        saveResults(result);

        // Transform recommendations to include severity
        const toolsWithDetails = audit.tools.map((tool, idx) => {
          const rec = result.recommendations[idx];
          return {
            tool: tool.tool,
            currentPlan: tool.plan,
            recommendedPlan: rec?.recommendedPlan || tool.plan,
            monthlySpend: tool.monthlySpend,
            monthlySavings: rec?.monthlySavings || 0,
            reason: rec?.reason || "",
            severity: rec?.severity || "Medium",
          };
        });

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        // Save to database via API
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamSize: audit.teamSize,
            useCase: audit.useCase,
            audit: result,
            tools: toolsWithDetails,
            userId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save audit");
        }

        const { id } = await response.json();
        window.location.href = `/results/${id}`;
      } catch (error) {
        console.error("Error saving audit:", error);
        alert(error instanceof Error ? error.message : "Failed to save audit. Please try again.");
        setIsGenerating(false);
      }
    }, 1000);
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-6 py-16">
        <AuditHeader />

        <TeamInfo audit={audit} setAudit={setAudit} />

        <div className="mt-10 space-y-6">
          {audit.tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              updateTool={updateTool}
              removeTool={() => removeTool(tool.id)}
            />
          ))}
        </div>

        <button
          onClick={addTool}
          className="mt-8 w-full rounded-xl border border-dashed border-white/20 py-4 hover:bg-white/5 transition-colors"
        >
          + Add Another Tool
        </button>

        <button
          onClick={generateAudit}
          disabled={isGenerating}
          aria-busy={isGenerating}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
              <span>{progressMessage}</span>
            </>
          ) : (
            "Generate Audit"
          )}
        </button>
      </main>

      <Footer />
    </div>
  );
}