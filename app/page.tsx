"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { branding } from "@/config/branding";
import { 
  Sparkles, ArrowRight, ChevronDown, CheckCircle2, Zap, Play, Check, 
  Sparkle, ShieldCheck, Mail, Users, FileText, CircleDollarSign, Cpu, Layers, Award, Globe,
  Brain, Lock, Database, Search, MessageSquare, GitCompare, Share2, Rocket, Code, PieChart, Shield, ShoppingCart, Sliders, BarChart3
} from "lucide-react";
import { toolsCatalog } from "@/data/toolsCatalog";

// Steps for cascade creep story
const creepSteps = [
  { name: "ChatGPT", cost: "$20", icon: "💬", color: "bg-emerald-500/20 text-emerald-400" },
  { name: "Claude", cost: "$30", icon: "🧠", color: "bg-orange-500/20 text-orange-400" },
  { name: "Cursor", cost: "$20", icon: "💻", color: "bg-sky-500/20 text-sky-400" },
  { name: "Copilot", cost: "$39", icon: "🤖", color: "bg-indigo-500/20 text-indigo-400" },
  { name: "Perplexity", cost: "$20", icon: "🔍", color: "bg-purple-500/20 text-purple-400" },
  { name: "Midjourney", cost: "$30", icon: "🎨", color: "bg-pink-500/20 text-pink-400" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [creepStep, setCreepStep] = useState<number>(0);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const faqs = [
    {
      q: "Is my data secure?",
      a: "Yes. Your data is processed securely. Sensitive information is never included in public share links. We collect minimum workspace inputs manually without requiring direct connection to billing system APIs."
    },
    {
      q: "Which AI tools are supported?",
      a: "We support audits across ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, Perplexity, Midjourney, Notion AI, OpenAI API, Anthropic API, and many more developers tools."
    },
    {
      q: "How accurate are the recommendations?",
      a: "Our recommendations are compiled using a deterministic rules engine built on standard vendor pricing tiers. This summary is generated from deterministic audit results. AI explains—it does not calculate."
    },
    {
      q: "Can I compare different plans?",
      a: "Yes. Our tool marketplace allows you to filter plans, review standard capabilities, and view cost optimizations for team-scale configurations."
    },
    {
      q: "Do you integrate with our apps?",
      a: "Currently, we operate as a standalone checklist tool where users declare active licenses to maintain maximum privacy and avoid bank connection compliance requirements."
    },
    {
      q: "Can I export my reports?",
      a: "Absolutely. Reports can be exported as secure PDFs or shared using encrypted, unique URLs that strip private user details."
    }
  ];

  // Run creep cascade animation sequentially
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        let current = 0;
        setCreepStep(0);
        const timer = setInterval(() => {
          if (current < creepSteps.length + 1) {
            current += 1;
            setCreepStep(current);
          } else {
            clearInterval(timer);
          }
        }, 600);
        return () => clearInterval(timer);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -60px 0px",
      threshold: 0.08,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const targets = document.querySelectorAll(".reveal-on-scroll");
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black font-sans antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden mx-auto w-full max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Business Backdrop Layer */}
        <div className="absolute inset-0 bg-[url('/images/business-backdrop.png')] bg-cover bg-center bg-no-repeat opacity-[0.06] -z-20" />
        <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(132,204,22,0.08),_transparent_70%)] blur-[120px]" />

        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column (Text & Details) */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-lime-400">
                AI Stack Intelligence Platform
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.15] text-white">
                Build the right AI stack. <br />
                <span className="text-lime-400">Optimize</span> the one <br />you already have.
              </h1>

              <p className="mt-6 max-w-lg text-zinc-400 text-sm sm:text-base leading-relaxed">
                Discover, plan, and optimize your AI tools. <br />
                Cut unnecessary spend and boost team productivity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/builder"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-lime-400 hover:bg-lime-300 px-6 py-3.5 text-xs font-bold text-black transition-all active:scale-[0.98]"
              >
                Build My AI Stack
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/audit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900 px-6 py-3.5 text-xs font-bold text-white hover:border-white/20 transition-all active:scale-[0.98]"
              >
                Audit Existing Stack
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/results/demo"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current text-zinc-400" />
                View Demo
              </Link>
            </div>

            {/* Integration logos */}
            <div className="pt-8 border-t border-white/5">
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-500">Trusted by teams worldwide</p>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold text-zinc-500">
                
                {/* OpenAI */}
                <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
                  <svg className="h-4.5 w-4.5 fill-current text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.74 11.59a2.76 2.76 0 0 0 .5-1.74 2.8 2.8 0 0 0-.8-1.95L19.96 6.4a2.82 2.82 0 0 0-1.95-.8 2.76 2.76 0 0 0-1.74.5A2.76 2.76 0 0 0 14.53 5.6a2.8 2.8 0 0 0-1.95-.8L11.09 3.3a2.82 2.82 0 0 0-1.95-.8 2.76 2.76 0 0 0-1.74.5 2.76 2.76 0 0 0-.5 1.74 2.8 2.8 0 0 0 .8 1.95L9.2 8.19a2.82 2.82 0 0 0 1.95.8 2.76 2.76 0 0 0 1.74-.5 2.76 2.76 0 0 0 1.74.5 2.8 2.8 0 0 0 1.95.8l1.49 1.5a2.82 2.82 0 0 0 1.95.8 2.76 2.76 0 0 0 1.74-.5zM12 12a1 1 0 1 1-1-1 1 1 0 0 1 1 1z" />
                  </svg>
                  <span className="font-sans text-[11px] font-semibold text-zinc-400">OpenAI</span>
                </div>

                {/* Anthropic */}
                <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
                  <svg className="h-4.5 w-4.5 fill-current text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22h4.5l2.25-5h6.5l2.25 5H22L12 2zm1 12h-2l1-4.5 1 4.5z" />
                  </svg>
                  <span className="font-mono text-[11px] font-bold uppercase text-zinc-400">Anthropic</span>
                </div>

                {/* Cursor */}
                <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
                  <svg className="h-4.5 w-4.5 fill-current text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 3.5l11 11-4.5.5 3 5.5-2.5 1.5-3-5.5-4 3.5z" />
                  </svg>
                  <span className="font-sans text-[11px] font-extrabold uppercase text-zinc-400">Cursor</span>
                </div>

                {/* Perplexity */}
                <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
                  <svg className="h-4.5 w-4.5 fill-current text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2a1 1 0 0 1 1 1v6.27l4.43-4.43a1 1 0 1 1 1.42 1.42L14.41 11H21a1 1 0 0 1 0 2h-6.59l4.43 4.43a1 1 0 0 1-1.42 1.42L13 14.41V21a1 1 0 0 1-2 0v-6.59l-4.43 4.43a1 1 0 0 1-1.42-1.42L9.59 13H3a1 1 0 0 1 0-2h6.59L5.16 6.57A1 1 0 0 1 6.58 5.15L11 9.59V3a1 1 0 0 1 1-1z" />
                  </svg>
                  <span className="font-sans text-[11px] font-medium text-zinc-400">perplexity</span>
                </div>

                {/* Midjourney */}
                <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
                  <svg className="h-4.5 w-4.5 fill-current text-zinc-500 hover:text-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18h16l-3-6H7l-3 6zm0 2h16c1 0 2-.5 2-1.5S21 17 20 17H4c-1 0-2 .5-2 1.5S3 20 4 20z" />
                  </svg>
                  <span className="font-sans text-[11px] font-semibold italic text-zinc-400">Midjourney</span>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column (Laptop Mockup) */}
          <div className="lg:col-span-6 relative z-10 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl transform lg:scale-110 lg:translate-x-6 origin-right transition-all duration-500 hover:scale-[1.12]">
              <img 
                src="/images/laptop-mockup.png" 
                alt="StackAudit Dashboard Mockup" 
                className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(132,204,22,0.12)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-white/10 bg-zinc-950 py-14 reveal-on-scroll">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 text-center">
            
            {/* Stat 1 */}
            <div className="border-r border-white/5 last:border-0 pr-2 flex flex-col items-center justify-center">
              <CircleDollarSign className="h-6.5 w-6.5 text-lime-400 mb-3" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-lime-400 tracking-tight">$12M+</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mt-2.5">Total savings identified</p>
            </div>

            {/* Stat 2 */}
            <div className="border-r border-white/5 last:border-0 pr-2 flex flex-col items-center justify-center">
              <Cpu className="h-6.5 w-6.5 text-zinc-400 mb-3" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">150+</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mt-2.5">AI tools tracked</p>
            </div>

            {/* Stat 3 */}
            <div className="border-r border-white/5 last:border-0 pr-2 flex flex-col items-center justify-center">
              <Layers className="h-6.5 w-6.5 text-zinc-400 mb-3" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">2,500+</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mt-2.5">Stacks optimized</p>
            </div>

            {/* Stat 4 */}
            <div className="border-r border-white/5 last:border-0 pr-2 flex flex-col items-center justify-center">
              <Award className="h-6.5 w-6.5 text-zinc-400 mb-3" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">98%</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mt-2.5">Customer satisfaction</p>
            </div>

            {/* Stat 5 */}
            <div className="flex flex-col items-center justify-center">
              <Globe className="h-6.5 w-6.5 text-zinc-400 mb-3" />
              <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">40+</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mt-2.5">Countries worldwide</p>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={observerRef} className="py-24 bg-black relative overflow-hidden" id="product">
        <div className="absolute inset-0 bg-[url('/images/money-backdrop.jpg')] bg-cover bg-center bg-no-repeat opacity-20 -z-20" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-[350px] w-[350px] -z-10 rounded-full bg-lime-500/5 blur-[120px]" />
        
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Stop Overpaying <br />for AI Tools
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                AI subscriptions add up faster than you think. Most teams pay for licenses they don&apos;t fully use, overlapping feature sets, and duplicate profiles.
              </p>
              <Link href="/audit" className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors">
                See how much you could save
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right Column (Creep Cascade) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="space-y-3">
                  {creepSteps.map((step, idx) => {
                    const isActive = creepStep > idx;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between rounded-xl p-3.5 border transition-all duration-300 ${
                          isActive 
                            ? "border-white/10 bg-white/5 opacity-100 translate-y-0" 
                            : "border-transparent bg-transparent opacity-10 translate-y-2"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${step.color}`}>
                            {step.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{step.name}</p>
                            <p className="text-[9px] text-zinc-500">Individual Seat</p>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-xs text-white font-bold">{step.cost}/mo</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Yearly */}
                  {creepStep >= creepSteps.length && (
                    <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center transition-all duration-500">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Accrued Spend</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Scaled across developers and tools</p>
                      </div>
                      <div className="bg-lime-500/10 border border-lime-500/25 px-4 py-2 rounded-xl text-right font-mono">
                        <span className="text-xl font-black text-lime-400">$8,640/year</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-white/10 bg-zinc-950 py-28 reveal-on-scroll">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-lime-400">How StackAudit Works</span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-3 text-white">
              AI Stack Intelligence, Built on Trust
            </h2>
            <p className="mt-4 text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">
              StackAudit combines deterministic analysis with AI reasoning to help you audit, optimize, and build the perfect AI stack for your team.
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-lime-500/20 bg-lime-500/5 px-4 py-1.5 text-xs text-lime-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>AI Explains. Our Engine Calculates.</span>
            </div>
          </div>

          {/* Workflow Diagram Grid */}
          <div className="grid gap-6 lg:grid-cols-5 items-stretch">
            
            {/* Step 1: INPUT */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 font-black font-mono text-[9px]">
                    1 INPUT
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-3">Your AI Ecosystem</p>
                
                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <Users className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Team Size & Departments</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <Sliders className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Current AI Tools</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <CircleDollarSign className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Monthly Spending</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Usage & Requirements</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2 text-[10px] text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>Your data is secure & private</span>
              </div>
            </div>

            {/* Step 2: DETERMINISTIC ENGINE */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 font-black font-mono text-[9px]">
                    2 DETERMINISTIC ENGINE
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-3">Calculates. Never Guesses.</p>

                <div className="rounded-2xl border border-cyan-500/25 bg-black/40 p-5 mt-4 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Cpu className="h-7 w-7 text-cyan-400 mb-2" />
                    <p className="text-xs font-bold text-white">StackAudit Rules Engine</p>
                  </div>
                  <div className="space-y-2 text-[11px] text-zinc-300 font-medium">
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /> <span>Pricing Database</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /> <span>Usage Analysis</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /> <span>Overlap Detection</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /> <span>Best Fit Matching</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-cyan-400" /> <span>Cost Optimization</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-center gap-2 text-[10px] text-cyan-400 justify-center">
                <Lock className="h-3.5 w-3.5" />
                <span>100% Deterministic Always Accurate</span>
              </div>
            </div>

            {/* Step 3: STRUCTURED RESULTS */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 font-black font-mono text-[9px]">
                    3 STRUCTURED RESULTS
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-3">Facts, Not Opinions</p>

                <div className="rounded-2xl border border-emerald-500/25 bg-black/40 p-5 mt-4 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <BarChart3 className="h-7 w-7 text-emerald-400 mb-2" />
                    <p className="text-xs font-bold text-white">Calculated Insights</p>
                  </div>
                  <div className="space-y-2 text-[11px] text-zinc-300 font-medium">
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Total Monthly Spend</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Optimization Score</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Annual Savings Potential</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Top Recommendations</span></div>
                    <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> <span>Risk & Overlap Alerts</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2 text-[10px] text-emerald-400 justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified. Reliable. Audit-Ready.</span>
              </div>
            </div>

            {/* Step 4: AI INTELLIGENCE LAYER */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 font-black font-mono text-[9px]">
                    4 AI INTELLIGENCE LAYER
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-3">Explains. Advises. Guides.</p>

                <div className="rounded-2xl border border-purple-500/25 bg-black/40 p-5 mt-4 space-y-3.5">
                  <div className="flex flex-col items-center text-center">
                    <Brain className="h-7 w-7 text-purple-400 mb-2" />
                    <p className="text-xs font-bold text-white">AI Agent Orchestrator</p>
                  </div>
                  <div className="space-y-2 text-[10px] text-zinc-300 font-medium">
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Audit Analyst</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Explains what's happening</p>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Optimization Advisor</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Suggests better choices</p>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Procurement Advisor</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Builds the best stack</p>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Marketplace Expert</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Compares tools & plans</p>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Executive Writer</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Creates board-ready reports</p>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5"><span className="text-[8px] bg-purple-500/15 text-purple-300 border border-purple-500/20 px-1 rounded">cb</span> Ask StackAudit</p>
                      <p className="text-[9px] text-zinc-500 ml-5">Answers your questions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 flex items-center gap-2 text-[10px] text-purple-400 justify-center">
                <Brain className="h-3.5 w-3.5" />
                <span>AI adds clarity. You stay in control.</span>
              </div>
            </div>

            {/* Step 5: ACTIONABLE OUTCOMES */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/5 bg-zinc-900/10 p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 font-black font-mono text-[9px]">
                    5 ACTIONABLE OUTCOMES
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-3">Decide with Confidence</p>

                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Executive Summary</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <CircleDollarSign className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Cost Optimization</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <Database className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Stack Builder</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <GitCompare className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Tool Comparisons</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <Share2 className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Shareable Reports</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 flex items-center gap-2.5 text-xs">
                    <MessageSquare className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-300 font-semibold">Ask Anything</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 flex items-center gap-2 text-[10px] text-teal-400 justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified. Secure. Dynamic.</span>
              </div>
            </div>

          </div>

          {/* Trust and Transparency Square Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-14">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-lime-500/20 hover:bg-zinc-900/60 transition-all shadow-lg">
              <ShieldCheck className="h-8 w-8 text-lime-400 mb-4" />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">Built on Trust & Transparency</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-lime-500/20 hover:bg-zinc-900/60 transition-all shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-lime-400 mb-4" />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">Deterministic Calculations</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-lime-500/20 hover:bg-zinc-900/60 transition-all shadow-lg">
              <Sliders className="h-8 w-8 text-lime-400 mb-4" />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">AI for Explanation Only</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-lime-500/20 hover:bg-zinc-900/60 transition-all shadow-lg">
              <Users className="h-8 w-8 text-lime-400 mb-4" />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">Your Data, Your Control</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center aspect-square hover:border-lime-500/20 hover:bg-zinc-900/60 transition-all shadow-lg">
              <Lock className="h-8 w-8 text-lime-400 mb-4" />
              <span className="text-xs sm:text-sm font-bold text-white leading-snug">Enterprise-Grade Security</span>
            </div>
          </div>

          {/* Perfect For Section */}
          <div className="mt-12 text-center">
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500">Perfect For</p>
            <div className="mt-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-bold text-zinc-400">
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Rocket className="h-4 w-4 text-lime-400" />
                <span>Startups</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Code className="h-4 w-4 text-lime-400" />
                <span>Engineering Teams</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <PieChart className="h-4 w-4 text-lime-400" />
                <span>Finance Leaders</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Shield className="h-4 w-4 text-lime-400" />
                <span>CTOs</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <ShoppingCart className="h-4 w-4 text-lime-400" />
                <span>Procurement Teams</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Value Prop & Preview Dashboard Section */}
      <section className="py-24 bg-black border-t border-white/10 reveal-on-scroll">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left side text */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Get <span className="text-lime-400">Clarity</span>. <br />
                Save <span className="text-lime-400">More</span>. <br />
                Work Smarter.
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                StackAudit gives you a clear view of your AI spend, highlights redundancy win opportunities, and recommends the best configurations customized for your team.
              </p>
              <div className="pt-2">
                <Link 
                  href="/results/demo" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-lime-400 hover:text-lime-300 transition-colors"
                >
                  View Sample Report
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right side Dashboard Mockup */}
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="font-mono text-[9px] text-zinc-500">acme-corp-audit-report.json</span>
                <span className="text-lime-400 font-mono text-[9px] font-bold">Total Savings: $1,825/mo</span>
              </div>

              {/* Opportunities grid */}
              <div className="space-y-3.5">
                <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="rounded bg-lime-500/10 border border-lime-500/20 text-lime-400 px-1.5 py-0.5 font-bold font-mono text-[8px]">
                      DOWNGRADE CHATGPT
                    </span>
                    <p className="font-bold text-white mt-1.5">Consolidate Chatbot Seats</p>
                  </div>
                  <span className="font-mono font-bold text-lime-400">-$1,075/mo</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="rounded bg-lime-500/10 border border-lime-500/20 text-lime-400 px-1.5 py-0.5 font-bold font-mono text-[8px]">
                      SWITCH CURSOR PLAN
                    </span>
                    <p className="font-bold text-white mt-1.5">Downgrade Business to Pro</p>
                  </div>
                  <span className="font-mono font-bold text-lime-400">-$300/mo</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="rounded bg-lime-500/10 border border-lime-500/20 text-lime-400 px-1.5 py-0.5 font-bold font-mono text-[8px]">
                      COPILOT SEATS
                    </span>
                    <p className="font-bold text-white mt-1.5">Downgrade Enterprise to Business</p>
                  </div>
                  <span className="font-mono font-bold text-lime-400">-$300/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/10 bg-zinc-950 py-24 reveal-on-scroll" id="about">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Loved by Forward-thinking Teams
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-black p-6 flex flex-col justify-between hover:border-white/15 transition-all">
              <div>
                <div className="flex text-amber-400 text-xs mb-3">★ ★ ★ ★ ★</div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;StackAudit helped us cut unnecessary AI spend by 32%. We were paying for duplicates we didn&apos;t realize existed.&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center font-bold text-[10px]">
                  SL
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sarah Lee</p>
                  <p className="text-[9px] text-zinc-500">CTO, Nova Studio</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black p-6 flex flex-col justify-between hover:border-white/15 transition-all">
              <div>
                <div className="flex text-amber-400 text-xs mb-3">★ ★ ★ ★ ★</div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;Finally, a tool that shows us the real impact of AI subscriptions. It gave our finance team exactly what they needed.&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center font-bold text-[10px]">
                  JC
                </div>
                <div>
                  <p className="text-xs font-bold text-white">James Carter</p>
                  <p className="text-[9px] text-zinc-500">Engineering Manager, Finova</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black p-6 flex flex-col justify-between hover:border-white/15 transition-all">
              <div>
                <div className="flex text-amber-400 text-xs mb-3">★ ★ ★ ★ ★</div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;A must-have for any team serious about AI productivity. Saved us $3,600 on Cursor licenses in under 5 minutes.&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center font-bold text-[10px]">
                  PS
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Priya Shah</p>
                  <p className="text-[9px] text-zinc-500">Head of Ops, BrightAI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-white/10 py-24 mx-auto max-w-4xl px-6 w-full reveal-on-scroll" id="resources">
        <h2 className="text-2xl font-extrabold tracking-tight text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-zinc-950 overflow-hidden transition-all hover:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 border-t border-white/5 text-[11px] text-zinc-400 leading-relaxed bg-black/45">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 py-16" id="pricing">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-12 mb-12">
            {/* Logo/Hook */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-lg font-bold text-white">{branding.name}</span>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Ready to optimize your AI stack? Join thousands of teams saving time and money with StackAudit.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Product</h4>
              <ul className="space-y-2 text-[11px] text-zinc-500">
                <li><Link href="/audit" className="hover:text-white transition-colors">Live Audit</Link></li>
                <li><Link href="/builder" className="hover:text-white transition-colors">Stack Builder</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Company</h4>
              <ul className="space-y-2 text-[11px] text-zinc-500">
                <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/#resources" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Stay Updated Newsletter */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stay Updated</h4>
              <p className="text-[10px] text-zinc-500">Get the latest AI insights and tips.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2 text-[11px] text-white focus:border-lime-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 hover:bg-lime-300 p-2 text-black transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-zinc-600 gap-4">
            <span>&copy; {new Date().getFullYear()} {branding.name}. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
                Your data is processed securely. Sensitive information is never included in public share links.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}