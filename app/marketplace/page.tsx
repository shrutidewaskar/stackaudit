"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toolsCatalog } from "@/data/toolsCatalog";
import { Search, ExternalLink, Star, AlertCircle, ShoppingBag, GitCompare, Check, X } from "lucide-react";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "compare">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Head-to-Head Comparison States
  const [toolAName, setToolAName] = useState<string>("Cursor");
  const [toolBName, setToolBName] = useState<string>("GitHub Copilot");

  // Category Options
  const categories = ["All", "Development", "Writing", "Research", "Design", "Operations", "Meetings"];

  // Filtering logic
  const filteredTools = useMemo(() => {
    return toolsCatalog.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toolLogos: Record<string, { bg: string; icon: string }> = {
    ChatGPT: { bg: "from-emerald-500 to-teal-600 shadow-emerald-500/10", icon: "GPT" },
    Claude: { bg: "from-orange-500 to-amber-600 shadow-orange-500/10", icon: "CL" },
    Cursor: { bg: "from-sky-500 to-indigo-600 shadow-sky-500/10", icon: "CU" },
    "GitHub Copilot": { bg: "from-indigo-500 to-purple-600 shadow-indigo-500/10", icon: "CO" },
    Gemini: { bg: "from-blue-500 to-violet-600 shadow-blue-500/10", icon: "GE" },
    Perplexity: { bg: "from-purple-500 to-fuchsia-600 shadow-purple-500/10", icon: "PE" },
    Midjourney: { bg: "from-pink-500 to-rose-600 shadow-pink-500/10", icon: "MJ" },
    v0: { bg: "from-rose-500 to-red-600 shadow-rose-500/10", icon: "V0" },
    Windsurf: { bg: "from-cyan-500 to-blue-600 shadow-cyan-500/10", icon: "WS" },
    "Otter.ai": { bg: "from-yellow-500 to-orange-600 shadow-yellow-500/10", icon: "OT" },
    "Zapier Central": { bg: "from-red-500 to-orange-600 shadow-red-500/10", icon: "ZP" },
  };

  const getLogo = (name: string) => {
    return toolLogos[name] || { bg: "from-zinc-500 to-zinc-700 shadow-zinc-500/10", icon: name.substring(0, 2).toUpperCase() };
  };

  // Get compared tools data
  const toolA = useMemo(() => toolsCatalog.find((t) => t.name === toolAName), [toolAName]);
  const toolB = useMemo(() => toolsCatalog.find((t) => t.name === toolBName), [toolBName]);

  // Quick compare helper
  const setQuickCompare = (a: string, b: string) => {
    setToolAName(a);
    setToolBName(b);
    setActiveTab("compare");
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Platform Module: Discover & Compare
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              AI Tool Marketplace
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400 text-sm">
              Discover verified pricing details, category parameters, and run head-to-head matches between ecosystem platforms.
            </p>
          </div>

          {/* Module Capabilities Switcher */}
          <div className="flex gap-1.5 rounded-xl bg-zinc-950 p-1 border border-white/5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "catalog"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Discover Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "compare"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <GitCompare className="h-4 w-4" />
              Head-to-Head Compare
            </button>
          </div>
        </div>

        {/* TAB 1: CATALOG DIRECTORY */}
        {activeTab === "catalog" && (
          <>
            {/* Filter Toolbar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-grow max-w-md rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-2.5 flex items-center gap-2.5">
                <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools by name, utility, or keywords..."
                  className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-500"
                />
              </div>

              {/* Categories select */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all ${
                      selectedCategory === category
                        ? "border-white bg-white text-black"
                        : "border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/10 text-zinc-400"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredTools.length === 0 && (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/10 p-16 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No tools match your query</h3>
                <p className="text-zinc-500 max-w-sm mx-auto text-xs">
                  Try adjusting your search criteria, removing filters, or clearing the query.
                </p>
              </div>
            )}

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredTools.map((tool) => {
                const alternatives = toolsCatalog
                  .filter((t) => t.category === tool.category && t.name !== tool.name)
                  .slice(0, 2)
                  .map((t) => t.name);

                const logo = getLogo(tool.name);

                return (
                  <div 
                    key={tool.name} 
                    className="flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all duration-300"
                  >
                    <div>
                      {/* Top line */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                          {tool.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{tool.rating.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Title & Website Link */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {/* Logo Avatar */}
                          <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${logo.bg} flex items-center justify-center font-bold tracking-tight text-[11px] shadow-lg text-white`}>
                            {logo.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{tool.name}</h3>
                            <p className="text-xs text-indigo-300 font-mono mt-0.5">{tool.pricing}</p>
                          </div>
                        </div>
                        <a 
                          href={tool.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-150 shrink-0"
                          aria-label={`Visit ${tool.name} website`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                        {tool.description}
                      </p>

                      {/* Best For */}
                      <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs leading-normal mb-4">
                        <span className="font-semibold text-zinc-200">Best for: </span>
                        <span className="text-zinc-400">{tool.bestFor}</span>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid gap-4 grid-cols-2 mb-4 text-xs">
                        <div>
                          <span className="font-semibold text-emerald-400 block mb-1.5">Pros</span>
                          <ul className="space-y-1 text-zinc-400">
                            {tool.pros.slice(0, 2).map((pro, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-rose-400 block mb-1.5">Cons</span>
                          <ul className="space-y-1 text-zinc-400">
                            {tool.cons.slice(0, 2).map((con, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom line: Alternatives */}
                    {alternatives.length > 0 && (
                      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setQuickCompare(tool.name, alternatives[0])}
                            className="text-[10px] text-zinc-400 hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <GitCompare className="h-3 w-3" />
                            Compare with {alternatives[0]}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {alternatives.map((alt) => (
                            <span key={alt} className="rounded-lg bg-zinc-950 border border-white/5 px-2 py-0.5 text-zinc-400 font-mono text-[10px]">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TAB 2: HEAD-TO-HEAD COMPARISON DECK */}
        {activeTab === "compare" && (
          <div className="space-y-8">
            {/* Quick Matchups Selection bar */}
            <div className="rounded-2xl border border-white/5 bg-zinc-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Quick Matchups:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCompare("Cursor", "GitHub Copilot")}
                  className="rounded-xl border border-white/5 hover:border-white/20 bg-zinc-900/60 hover:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Cursor vs GitHub Copilot
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCompare("Claude", "ChatGPT")}
                  className="rounded-xl border border-white/5 hover:border-white/20 bg-zinc-900/60 hover:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Claude vs ChatGPT
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCompare("Perplexity", "Gemini")}
                  className="rounded-xl border border-white/5 hover:border-white/20 bg-zinc-900/60 hover:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Perplexity vs Gemini
                </button>
              </div>
            </div>

            {/* Head-to-Head Picker selectors */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Selector A */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-sm">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Compare Tool A</label>
                <select
                  value={toolAName}
                  onChange={(e) => setToolAName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none"
                >
                  {toolsCatalog.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Selector B */}
              <div className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-sm">
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">Compare Tool B</label>
                <select
                  value={toolBName}
                  onChange={(e) => setToolBName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none"
                >
                  {toolsCatalog.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix comparison Table */}
            {toolA && toolB && (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/20 overflow-hidden shadow-2xl backdrop-blur-sm">
                <table className="w-full border-collapse text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-950 text-white font-semibold">
                    <tr>
                      <th className="p-5 border-b border-white/5 w-1/4">Specification</th>
                      <th className="p-5 border-b border-white/5 w-3/8 text-indigo-400">{toolA.name}</th>
                      <th className="p-5 border-b border-white/5 w-3/8 text-sky-400">{toolB.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Logo & Category */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Avatar / Category</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getLogo(toolA.name).bg} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md`}>
                            {getLogo(toolA.name).icon}
                          </div>
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 uppercase tracking-wider font-bold">{toolA.category}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getLogo(toolB.name).bg} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md`}>
                            {getLogo(toolB.name).icon}
                          </div>
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 uppercase tracking-wider font-bold">{toolB.category}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Description */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">About</td>
                      <td className="p-5 leading-relaxed text-xs">{toolA.description}</td>
                      <td className="p-5 leading-relaxed text-xs">{toolB.description}</td>
                    </tr>

                    {/* Pricing */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Pricing Plan</td>
                      <td className="p-5 font-mono text-xs text-white">{toolA.pricing}</td>
                      <td className="p-5 font-mono text-xs text-white">{toolB.pricing}</td>
                    </tr>

                    {/* Rating */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Ecosystem Rating</td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                          <Star className="h-4 w-4 fill-current" />
                          {toolA.rating.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                          <Star className="h-4 w-4 fill-current" />
                          {toolB.rating.toFixed(2)}
                        </div>
                      </td>
                    </tr>

                    {/* Best for */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Best For</td>
                      <td className="p-5 text-zinc-300 text-xs">{toolA.bestFor}</td>
                      <td className="p-5 text-zinc-300 text-xs">{toolB.bestFor}</td>
                    </tr>

                    {/* Strengths (Pros) */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Key Strengths</td>
                      <td className="p-5">
                        <ul className="space-y-1.5 text-xs text-zinc-300">
                          {toolA.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-5">
                        <ul className="space-y-1.5 text-xs text-zinc-300">
                          {toolB.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Weaknesses (Cons) */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Drawbacks / Cons</td>
                      <td className="p-5">
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                          {toolA.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <X className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-5">
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                          {toolB.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <X className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Link */}
                    <tr>
                      <td className="p-5 font-semibold text-zinc-300">Official Link</td>
                      <td className="p-5">
                        <a 
                          href={toolA.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-white hover:underline transition-colors font-bold"
                        >
                          Visit website
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                      <td className="p-5">
                        <a 
                          href={toolB.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-white hover:underline transition-colors font-bold"
                        >
                          Visit website
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
