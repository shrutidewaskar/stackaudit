import Link from "next/link";
import { branding } from "@/config/branding";
import { Sparkles, Layers, ShoppingBag, BarChart2, Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4.5">
        {/* Brand Logo with Glow */}
        <Link href="/" className="flex items-center gap-2 group relative">
          <div className="absolute -inset-1 rounded-lg bg-indigo-500/20 opacity-0 blur-md group-hover:opacity-100 transition-all duration-300" />
          <div className="relative rounded-lg bg-white/10 p-1.5 border border-white/5 transition-all group-hover:bg-white/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="relative text-lg font-bold tracking-tight text-white transition-all group-hover:text-zinc-300">
            {branding.name}
          </span>
        </Link>

        {/* Capabilities Navigation */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Link href="/builder" className="flex items-center gap-2 hover:text-white transition-colors py-1">
            <Layers className="h-4 w-4 text-zinc-500 hover:text-indigo-400" />
            Stack Builder
          </Link>
          <Link href="/marketplace" className="flex items-center gap-2 hover:text-white transition-colors py-1">
            <ShoppingBag className="h-4 w-4 text-zinc-500 hover:text-indigo-400" />
            Marketplace
          </Link>
          <Link href="/results/demo" className="flex items-center gap-2 hover:text-white transition-colors py-1">
            <BarChart2 className="h-4 w-4 text-zinc-500 hover:text-indigo-400" />
            Demo Insights
          </Link>
        </div>

        {/* Diagnostic Action Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/audit"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-200 hover:bg-white hover:text-black hover:border-white transition-all duration-200 active:scale-[0.97]"
          >
            <Zap className="h-3.5 w-3.5 fill-current text-amber-400 shrink-0" />
            Live Audit
          </Link>
        </div>
      </div>
    </nav>
  );
}
