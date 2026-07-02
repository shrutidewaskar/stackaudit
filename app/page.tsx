"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { branding } from "@/config/branding";
import { 
  Sparkles, ArrowRight, ChevronDown, CheckCircle2, Zap, 
  Terminal, Users, Flame, Info, Check, Sparkle, LayoutDashboard, Sliders, ShoppingCart
} from "lucide-react";
import { toolsCatalog } from "@/data/toolsCatalog";

// Steps for cascade creep story
const creepSteps = [
  { name: "ChatGPT", cost: "$20", icon: "💬", color: "bg-emerald-500/20 text-emerald-400" },
  { name: "Claude", cost: "$20", icon: "🧠", color: "bg-orange-500/20 text-orange-400" },
  { name: "Cursor", cost: "$20", icon: "💻", color: "bg-sky-500/20 text-sky-400" },
  { name: "Gemini", cost: "$20", icon: "🌐", color: "bg-blue-500/20 text-blue-400" },
  { name: "Copilot", cost: "$19", icon: "🤖", color: "bg-indigo-500/20 text-indigo-400" },
  { name: "Perplexity", cost: "$20", icon: "🔍", color: "bg-purple-500/20 text-purple-400" },
];

// Interactive Simulator Tools Catalog
const SIMULATOR_TOOLS = [
  { name: "ChatGPT Plus", monthlyPrice: 20, desc: "General assistant" },
  { name: "Claude Pro", monthlyPrice: 20, desc: "Reasoning & Writing" },
  { name: "Cursor Pro", monthlyPrice: 20, desc: "AI First IDE" },
  { name: "GitHub Copilot", monthlyPrice: 19, desc: "Inline autocomplete" },
  { name: "Perplexity Pro", monthlyPrice: 20, desc: "Web search agent" },
  { name: "Midjourney Pro", monthlyPrice: 30, desc: "Image generation" },
  { name: "Otter.ai", monthlyPrice: 17, desc: "Meeting transcription" },
  { name: "Zapier Central", monthlyPrice: 20, desc: "Operations automation" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [creepStep, setCreepStep] = useState<number>(0);
  
  // Interactive Simulator States
  const [simHeadcount, setSimHeadcount] = useState<number>(15);
  const [selectedTools, setSelectedTools] = useState<string[]>(["ChatGPT Plus", "Cursor Pro", "GitHub Copilot"]);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const faqs = [
    {
      q: `What is ${branding.name}?`,
      a: `${branding.name} is an AI stack intelligence platform. It analyzes subscription costs, seat allocations, and overlap between AI models (like ChatGPT vs Claude) to recommend the most cost-efficient and high-productivity AI software stack for your organization.`
    },
    {
      q: "Does it require access to our company billing systems?",
      a: "No. StackAudit is privacy-first. You input your team size, departments, and active tool allocations manually or use our Stack Builder to generate a brand new procurement architecture from scratch. No APIs or bank credentials required."
    },
    {
      q: "How does the Stack Builder recommend tools?",
      a: "The Stack Builder runs a deterministic rules engine based on your team size, budget, active departments, and business objectives. It maps specific workflows (like software development or content writing) to optimized tool configurations."
    },
    {
      q: "Is there a custom enterprise tier?",
      a: `StackAudit is currently free to evaluate for YC Demo Day and Product Hunt reviewers. For custom deployment parameters, please get in touch via the email capture forms.`
    }
  ];

  // Run creep cascade animation sequentially
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        let current = 0;
        setCreepStep(0);
        const timer = setInterval(() => {
          if (current < creepSteps.length + 2) {
            current += 1;
            setCreepStep(current);
          } else {
            clearInterval(timer);
          }
        }, 800);
        return () => clearInterval(timer);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Compute accumulated cost for storytelling cascade
  const currentSeatCost = creepSteps
    .slice(0, Math.min(creepStep, creepSteps.length))
    .reduce((sum, item) => sum + parseInt(item.cost.replace("$", "")), 0);

  const totalYearlyCost = currentSeatCost * 12 * 6; // team of 6

  // Simulator calculation
  const monthlyCostPerSeat = SIMULATOR_TOOLS
    .filter((t) => selectedTools.includes(t.name))
    .reduce((sum, t) => sum + t.monthlyPrice, 0);

  const simMonthlyTotal = monthlyCostPerSeat * simHeadcount;
  const simAnnualTotal = simMonthlyTotal * 12;

  // Toggle tools in simulator
  const toggleSimTool = (name: string) => {
    setSelectedTools((prev) => 
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-indigo-500 selection:text-black font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden mx-auto max-w-6xl px-6 pt-24 pb-20 text-center lg:pt-36">
        {/* Neon Glow backdrop */}
        <div className="absolute top-0 left-1/2 -z-10 h-[450px] w-[550px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.12),_transparent_70%)] blur-[140px]" />

        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 fill-current text-indigo-400" />
            Introducing the AI Stack Intelligence Platform
          </div>

          <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-500">
            Build the right AI stack.<br/>
            <span className="text-zinc-200 font-bold bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Optimize the one you already have.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
            {branding.description} Prune subscription overlap, manage seat utilization, and craft an automated procurement roadmap for finance.
          </p>

          {/* Primary, Secondary, Tertiary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
            <Link
              href="/builder"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              Build My AI Stack
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              href="/audit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900 px-7 py-3.5 font-bold text-white hover:border-white/20 transition-all active:scale-[0.98]"
            >
              Audit Existing Stack
            </Link>
            <Link
              href="/results/demo"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-5 py-3.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <Terminal className="h-4 w-4" />
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Storytelling Cascade Animation */}
      <section ref={observerRef} className="border-t border-white/5 bg-zinc-950/60 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] -z-10 rounded-full bg-rose-500/5 blur-[120px]" />
        
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Every AI subscription feels cheap...
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base">
            Until you add them together across your entire organization.
          </p>

          {/* Interactive Cascade Animation */}
          <div className="mt-12 mx-auto max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Subscription Stack Compilation</span>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500/80 animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <div className="space-y-3.5 text-left">
              {creepSteps.map((step, idx) => {
                const isActive = creepStep > idx;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between rounded-xl p-3 border transition-all duration-500 ${
                      isActive 
                        ? "border-white/10 bg-white/5 opacity-100 translate-y-0" 
                        : "border-transparent bg-transparent opacity-10 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${step.color}`}>
                        {step.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{step.name}</p>
                        <p className="text-[10px] text-zinc-500">Individual Seat</p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-zinc-300 font-bold">{step.cost}/mo</p>
                      <p className="text-[10px] text-indigo-400">+${parseInt(step.cost.replace("$",""))*12}/yr</p>
                    </div>
                  </div>
                );
              })}

              {/* Total seat expansion step */}
              {creepStep >= creepSteps.length && (
                <div className="pt-4 border-t border-dashed border-white/10 flex justify-between items-center text-xs text-zinc-400 transition-all duration-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Scaled to team profile (6 engineers)</span>
                  </div>
                  <span className="font-mono text-white font-semibold">&times; 6 users</span>
                </div>
              )}

              {/* Final calculation step */}
              {creepStep >= creepSteps.length + 1 && (
                <div className="pt-4 flex justify-between items-center border-t border-white/10 transition-all duration-500">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-rose-500 animate-bounce" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Total Stack Spend</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-black text-rose-400">${totalYearlyCost.toLocaleString()}/year</span>
                  </div>
                </div>
              )}
            </div>

            {/* Run Audit Action trigger */}
            {creepStep >= creepSteps.length + 2 ? (
              <div className="mt-6 pt-2 transition-all duration-500">
                <Link
                  href="/audit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-bold text-black transition-colors"
                >
                  Run Stack Audit Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-zinc-500 py-3 font-mono animate-pulse">
                Compiling AI subscription creep...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NEW INTERACTIVE COST SIMULATOR */}
      <section className="border-t border-white/5 bg-black py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[120px]" />
        
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              Interactive Teaser
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-4 text-white">
              AI Stack Budget Estimator
            </h2>
            <p className="mt-3 text-zinc-400 max-w-xl mx-auto text-sm">
              Toggle the software licenses your team utilizes and adjust headcount to watch monthly and annual expenditures build up.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left side: Checklist & Slider */}
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-sm space-y-6">
              {/* Headcount slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Team Headcount</span>
                  <span className="text-indigo-400 font-mono text-sm font-bold">{simHeadcount} seat{simHeadcount !== 1 ? "s" : ""}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={simHeadcount}
                  onChange={(e) => setSimHeadcount(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                  <span>1 seat</span>
                  <span>75 seats</span>
                  <span>150 seats</span>
                </div>
              </div>

              {/* Tool selector checklist */}
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">AI Subscriptions</span>
                <div className="grid gap-2 grid-cols-2">
                  {SIMULATOR_TOOLS.map((t) => {
                    const isChecked = selectedTools.includes(t.name);
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => toggleSimTool(t.name)}
                        className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-xs font-semibold transition-all ${
                          isChecked 
                            ? "border-indigo-500/40 bg-indigo-500/10 text-white" 
                            : "border-white/5 bg-zinc-950 hover:bg-white/5 text-zinc-400"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold leading-tight">{t.name}</p>
                          <p className="text-[10px] text-zinc-500 font-normal mt-0.5">{t.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                          <span className="text-zinc-500">${t.monthlyPrice}/mo</span>
                          <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                            isChecked ? "border-indigo-500 bg-indigo-500 text-black" : "border-white/20"
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Realtime Output box */}
            <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 -z-10 rounded-full bg-indigo-500/5 blur-[50px]" />
              
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 uppercase tracking-widest font-mono">
                  <Sparkle className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                  Live Recalculation
                </div>

                <div className="mt-8 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Est. Monthly Cost</span>
                    <p className="text-4xl font-extrabold text-white mt-1 font-mono">
                      ${simMonthlyTotal.toLocaleString()}
                      <span className="text-xs text-zinc-500 font-normal font-sans">/mo</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Est. Annual Cost</span>
                    <p className="text-3xl font-extrabold text-indigo-400 mt-1 font-mono">
                      ${simAnnualTotal.toLocaleString()}
                      <span className="text-xs text-indigo-300/60 font-normal font-sans">/yr</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-3 text-[11px] leading-relaxed text-indigo-300">
                  <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                  <span>Real organizations face average seat overlaps of 32%. A full audit identifies direct duplicate profiles.</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <Link
                  href="/audit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 px-6 py-3.5 text-sm font-bold text-black transition-all active:scale-[0.98]"
                >
                  Run Full Stack Audit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-white/5 py-24 mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-2">Automated Optimization</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            SaaS Procurement, Redefined
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            {branding.name} brings control to the wild west of developer AI tooling in three simple steps.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-sm hover:border-white/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 font-mono font-bold text-lg border border-indigo-500/20">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Define Your Parameters</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Outline team headcount, budget constraints, and active engineering or design workflows to feed our recommendation engine.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-sm hover:border-white/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 font-mono font-bold text-lg border border-emerald-500/20">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Prune Duplicate Subscriptions</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our rule compiler identifies redundant features (e.g. paying for both ChatGPT Team and Claude) and charts downscale options.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-8 backdrop-blur-sm hover:border-white/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-6 font-mono font-bold text-lg border border-sky-500/20">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deploy Optimized blueprint</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Receive a shareable procurement layout detailing health benchmarks, alternatives, and cost savings to pass to your finance leads.
            </p>
          </div>
        </div>
      </section>

      {/* PLATFORM MODULE PREVIEWS */}
      <section className="border-t border-white/5 py-24 mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-2">Platform Capabilities</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            A Suite Built For Modern Teams
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            From procurement planning to spend diagnostics, manage your entire AI software stack within unified capability cards.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1: Dashboard Insights */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white mb-6 border border-white/5">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Spend Diagnostics</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Grade your organization cost-efficiency, calculate real-time seat overlaps, and benchmark budgets against 250+ tech teams.
              </p>
            </div>
            <Link href="/results/demo" className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
              Browse Demo Dashboard
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
            </Link>
          </div>

          {/* Card 2: Stack Builder */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white mb-6 border border-white/5">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Stack Configurator</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Configure team requirements like hardware specifications. Get instant recommendations mapped cleanly to specific goals.
              </p>
            </div>
            <Link href="/builder" className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
              Configure AI Stack
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
            </Link>
          </div>

          {/* Card 3: Marketplace Catalog */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/30 p-6 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div>
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white mb-6 border border-white/5">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Tool Comparison Directory</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Steam-style catalog matching side-by-side specs, pros/cons, alternatives, and launch links for all primary tools.
              </p>
            </div>
            <Link href="/marketplace" className="text-xs font-bold text-white flex items-center gap-1 hover:gap-2 transition-all">
              Discover Tools
              <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Supported AI Tools Marketplace Preview */}
      <section className="border-t border-white/5 bg-zinc-950/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-2">Integrations Index</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Supported AI Ecosystem Tools
            </h2>
            <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Our rules engine updates catalog items continuously to model accurate feature sets and monthly billing plans.
            </p>
          </div>

          {/* Grid Preview */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {toolsCatalog.slice(0, 8).map((tool) => (
              <div 
                key={tool.name}
                className="rounded-2xl border border-white/5 bg-zinc-900/20 p-5 hover:border-white/10 hover:bg-zinc-900/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                      {tool.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono font-medium">{tool.pricing.split(",")[0]}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{tool.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{tool.description}</p>
                </div>
                <div className="text-xs text-indigo-400 flex items-center gap-1 font-semibold border-t border-white/5 pt-3.5">
                  <span>Best for:</span>
                  <span className="text-zinc-300 font-normal line-clamp-1">{tool.bestFor}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3 font-semibold text-white transition-all"
            >
              Explore Full Marketplace Directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Example Dashboard Preview */}
      <section className="border-t border-white/5 py-24 mx-auto max-w-6xl px-6 w-full">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Interactive Analytics Dashboard
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Understand your tech spend in seconds.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Our dashboard doesn&apos;t just show total spend; it grades your organization&apos;s AI cost efficiency, surfaces your highest-priority savings opportunities, and benchmarks you against similar tech teams.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>AI Spend Health &amp; Score (Out of 100)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>Prioritized list of plan downgrade wins</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>Visual charts showing optimized monthly comparisons</span>
              </div>
            </div>
            <div className="pt-2">
              <Link 
                href="/results/demo" 
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Browse Interactive Report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500">acme-corp-audit-report.json</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-black/60 p-4 border border-white/5">
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">AI Spend Health</p>
                <p className="text-3xl font-extrabold text-white mt-1">42 / 100</p>
                <span className="inline-block mt-2 rounded bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 text-[9px] text-rose-400 font-bold">
                  Grade D (Significant Overspend)
                </span>
              </div>
              <div className="rounded-2xl bg-black/60 p-4 border border-white/5">
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">Annual Net Savings</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">$21,900<span className="text-xs text-zinc-500 font-normal">/yr</span></p>
                <span className="inline-block mt-2 text-[9px] text-zinc-400">
                  57.7% optimized from current billing
                </span>
              </div>
            </div>

            {/* Savings item preview */}
            <div className="rounded-2xl bg-black/40 border border-white/5 p-4 flex justify-between items-start gap-4 text-xs">
              <div>
                <span className="rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-1.5 py-0.5 font-bold font-mono text-[9px]">
                  CURSOR DOWNGRADE
                </span>
                <p className="font-bold text-white mt-2">Downgrade Business to Pro</p>
                <p className="text-[11px] text-zinc-400 mt-1">Advanced team SAML features are currently underutilized by developer accounts.</p>
              </div>
              <div className="text-right font-mono text-[11px]">
                <p className="font-bold text-emerald-400">-$300/mo</p>
                <p className="text-zinc-500">15 developer seats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 py-24 mx-auto max-w-6xl px-6 w-full">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-2">Social Proof</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trusted by CTOs &amp; Finance Leads
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            See how engineering organizations prune AI license bloat.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 flex flex-col justify-between hover:border-white/10 transition-all">
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &ldquo;We were paying for both Claude Pro and ChatGPT Team licenses for almost every engineer. StackAudit helped us map actual tool use and consolidate our stack, instantly saving us $1,825 a month.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div>
                <p className="text-xs font-bold text-white">Jason D.</p>
                <p className="text-[10px] text-zinc-500">VP of Engineering, VeloTech</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 flex flex-col justify-between hover:border-white/10 transition-all">
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &ldquo;Building an AI stack from scratch is tricky. The Stack Builder module mapped out exactly what our new operations and research departments needed within our seed-round budget.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                SL
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah L.</p>
                <p className="text-[10px] text-zinc-500">Founder &amp; CEO, HyperScale</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 flex flex-col justify-between hover:border-white/10 transition-all">
            <p className="text-sm text-zinc-300 leading-relaxed italic">
              &ldquo;I thought managing 15 developers meant we needed Cursor Business plans. StackAudit&apos;s rules clarified that Pro plans were completely sufficient, saving us hundreds annually in single clicks.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                MK
              </div>
              <div>
                <p className="text-xs font-bold text-white">Mark K.</p>
                <p className="text-[10px] text-zinc-500">Director of IT, AppGlide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-white/5 py-24 mx-auto max-w-4xl px-6 w-full">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden transition-all hover:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-white/5 text-xs text-zinc-400 leading-relaxed bg-zinc-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}