import Link from "next/link";
import { useEffect, useState } from "react";
import { branding } from "@/config/branding";
import { Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo with Glow */}
        <Link href="/" className="flex items-center gap-2 group relative">
          <div className="absolute -inset-1 rounded-lg bg-lime-500/20 opacity-0 blur-md group-hover:opacity-100 transition-all duration-300" />
          <div className="relative rounded-lg bg-white/5 p-1 border border-white/10 transition-all group-hover:bg-white/10">
            <Sparkles className="h-4.5 w-4.5 text-lime-400" />
          </div>
          <span className="relative text-lg font-bold tracking-tight text-white transition-all group-hover:text-zinc-300">
            {branding.name}
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
          <Link href="/#product" className="hover:text-white transition-colors py-1">
            Product
          </Link>
          <Link href="/marketplace" className="hover:text-white transition-colors py-1">
            Marketplace
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors py-1">
            Pricing
          </Link>
          <Link href="/#resources" className="hover:text-white transition-colors py-1">
            Resources
          </Link>
          <Link href="/#about" className="hover:text-white transition-colors py-1">
            About
          </Link>
        </div>

        {/* Dynamic Auth Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {user ? (
            <>
              <span className="text-zinc-500 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-zinc-300 hover:text-white cursor-pointer transition-colors"
              >
                Log out
              </button>
              <Link
                href="/audit"
                className="flex items-center gap-1 rounded-lg bg-lime-400 px-4 py-2 text-black hover:bg-lime-300 transition-all active:scale-[0.97]"
              >
                Audit Stack
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/results/demo" 
                className="text-zinc-400 hover:text-lime-400 border border-white/10 hover:border-lime-500/20 bg-zinc-900/40 px-3 py-1.5 rounded-lg transition-all active:scale-[0.97]"
              >
                Demo Use
              </Link>
              <Link href="/login" className="text-zinc-300 hover:text-white transition-colors ml-2">
                Log in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-lime-400 px-4 py-2 text-black hover:bg-lime-300 transition-all active:scale-[0.97]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
