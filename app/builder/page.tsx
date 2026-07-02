"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildStack, BuilderInput } from "@/rules/stackBuilder";
import { formatCurrency } from "@/rules/helpers";
import { 
  Check, AlertCircle, RefreshCw, 
  Sparkles, Layers, CheckCircle2 
} from "lucide-react";

export default function BuilderPage() {
  // Form state
  const [budget, setBudget] = useState<number>(500);
  const [teamSize, setTeamSize] = useState<number>(5);
  
  const [departments, setDepartments] = useState<string[]>(["Engineering"]);
  const [goals, setGoals] = useState<string[]>(["Coding", "Documentation"]);
  const [existingToolsInput, setExistingToolsInput] = useState<string>("");

  // Options lists
  const departmentOptions = [
    { id: "Engineering", label: "Engineering / Dev" },
    { id: "Design", label: "Design / Creative" },
    { id: "Marketing", label: "Marketing / Content" },
    { id: "Research", label: "Research / Analysis" },
    { id: "Operations", label: "Ops / Support" }
  ];

  const goalOptions = [
    { id: "Coding", label: "Software Coding & Autocomplete" },
    { id: "Research", label: "Research & Fact-checking" },
    { id: "Meetings", label: "Meeting Transcription & Notes" },
    { id: "Presentations", label: "Slide Deck Creation" },
    { id: "Documentation", label: "Technical & Copy Writing" },
    { id: "Image Generation", label: "Graphic & Image Creation" },
    { id: "Video", label: "Video Generation & Editing" }
  ];

  // Toggle helpers
  const handleDeptToggle = (dept: string) => {
    setDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept) 
        : [...prev, dept]
    );
  };

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  // Run stack builder rule engine deterministically (no memo needed since client-side math is extremely fast)
  const parsedTools = existingToolsInput
    ? existingToolsInput.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  const builderInput: BuilderInput = {
    budget: budget || 0,
    teamSize: teamSize || 1,
    departments,
    goals,
    existingTools: parsedTools
  };

  const result = buildStack(builderInput);

  // Spend visual helper
  const budgetUtilizationPercent = budget > 0 
    ? Math.min(100, (result.totalCost / budget) * 100)
    : 100;

  const isOverBudget = result.totalCost > budget && budget > 0;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
            Platform Module: Stack Builder
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            AI Stack Architect
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Specify your budget, headcount, and objectives. Our deterministic rule engine compiles the most cost-efficient, high-productivity software suite for your team.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left panel - Configurator Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/15 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                Parameters
              </h2>

              <div className="space-y-6">
                {/* Team Size */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                    <span>Team Headcount</span>
                    <span className="text-indigo-400 font-mono text-base">{teamSize} seat{teamSize !== 1 ? 's' : ''}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>1 seat</span>
                    <span>50 seats</span>
                    <span>100 seats</span>
                  </div>
                </div>

                {/* Monthly Budget */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                    <span>Monthly AI Budget</span>
                    <span className="text-indigo-400 font-mono text-base">{formatCurrency(budget)}/mo</span>
                  </label>
                  <div className="relative rounded-xl border border-white/10 bg-black/50 px-3 py-2 flex items-center">
                    <span className="text-zinc-500 font-mono mr-1.5">$</span>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={budget === 0 ? "" : budget}
                      onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-transparent border-0 outline-none w-full text-white font-mono placeholder-zinc-700"
                      placeholder="Enter budget (e.g. 500)"
                    />
                  </div>
                </div>

                {/* Departments */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Active Departments
                  </label>
                  <div className="grid gap-2 grid-cols-2">
                    {departmentOptions.map((dept) => {
                      const selected = departments.includes(dept.id);
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => handleDeptToggle(dept.id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                            selected 
                              ? "border-indigo-500/40 bg-indigo-500/10 text-white" 
                              : "border-white/5 bg-zinc-950 hover:bg-white/5 text-zinc-400"
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            selected ? "border-indigo-500 bg-indigo-500 text-black" : "border-white/20"
                          }`}>
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          {dept.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Primary Stack Objectives
                  </label>
                  <div className="space-y-2">
                    {goalOptions.map((goal) => {
                      const selected = goals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                            selected 
                              ? "border-indigo-500/40 bg-indigo-500/10 text-white" 
                              : "border-white/5 bg-zinc-950 hover:bg-white/5 text-zinc-400"
                          }`}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            selected ? "border-indigo-500 bg-indigo-500 text-black" : "border-white/20"
                          }`}>
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          {goal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Existing tools */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">
                    Existing AI Tools (Optional)
                  </label>
                  <input
                    type="text"
                    value={existingToolsInput}
                    onChange={(e) => setExistingToolsInput(e.target.value)}
                    placeholder="e.g. ChatGPT, Cursor, Otter.ai"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block leading-normal">
                    Separate multiple tools with commas. The architect respects existing tooling where logical.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Architecture Recommendation Output */}
          <div className="lg:col-span-7 space-y-6">
            {/* Output dashboard summary */}
            <div className="rounded-3xl border border-white/15 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Recommended AI Stack
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1 font-normal">
                  <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                  Realtime recalculation
                </span>
              </h2>

              {/* Spend Analytics */}
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-xs text-zinc-400">Total Stack Cost</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatCurrency(result.totalCost)}<span className="text-xs text-zinc-500">/mo</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-xs text-zinc-400">Remaining Budget</p>
                  <p className={`mt-1 text-2xl font-bold ${result.remainingBudget >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(result.remainingBudget)}<span className="text-xs text-zinc-500">/mo</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-xs text-zinc-400">License Count</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {result.recommendedStack.reduce((acc, curr) => acc + curr.seats, 0)} <span className="text-xs text-zinc-500">seats</span>
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Budget Utilization</span>
                  <span>{budgetUtilizationPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isOverBudget ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${budgetUtilizationPercent}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Allocated tools exceed the specified budget limit. Seat sizes optimized below standard levels.</span>
                  </div>
                )}
              </div>

              {/* Justification Box */}
              <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 text-sm text-indigo-200/90 leading-relaxed mb-6">
                <strong>Strategy Justification:</strong> {result.justification}
              </div>

              {/* Tool Recommendations */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Target Procurement</h3>
                {result.recommendedStack.map((tool, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-zinc-950 p-4 hover:border-white/10 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{tool.name}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono">{tool.plan}</span>
                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">{tool.category}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-normal max-w-md">{tool.reason}</p>
                    </div>
                    <div className="flex sm:flex-col justify-between items-end gap-1 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 font-mono">
                      <span className="text-xs text-zinc-500">{tool.seats} seat{tool.seats !== 1 ? 's' : ''} &times; ${tool.monthlyPrice}</span>
                      <span className="text-sm font-bold text-white">{formatCurrency(tool.totalCost)}<span className="text-xs text-zinc-500 font-normal">/mo</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative Stack */}
            {result.alternativeStack.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/20 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <h3 className="text-base font-bold mb-4 text-zinc-300">Alternative Options (Substitutes)</h3>
                <div className="space-y-3">
                  {result.alternativeStack.map((tool, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4 rounded-xl border border-white/5 bg-zinc-950/60 p-3 text-sm">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-300">{tool.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({tool.plan})</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{tool.reason}</p>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <p className="text-xs text-zinc-300 font-bold">{formatCurrency(tool.totalCost)}/mo</p>
                        <p className="text-[10px] text-zinc-500">{tool.seats} seats</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps / Expansion Roadmap */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/20 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <h3 className="text-base font-bold mb-4 text-zinc-300">Expansion Roadmap</h3>
              <div className="space-y-3">
                {result.upgradeSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
