"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { branding } from "@/config/branding";
import { Sparkles, Building2, ChevronDown, Users, FolderGit2, Link2, Settings, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/85 backdrop-blur-lg font-sans">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left Row: Logo and Org Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group relative">
            <div className="absolute -inset-1 rounded-lg bg-lime-500/20 opacity-0 blur-md group-hover:opacity-100 transition-all duration-300" />
            <div className="relative rounded-lg bg-white/5 p-1 border border-white/10 transition-all group-hover:bg-white/10">
              <Sparkles className="h-4.5 w-4.5 text-lime-400" />
            </div>
            <span className="relative text-lg font-bold tracking-tight text-white transition-all group-hover:text-zinc-300">
              {branding.name}
            </span>
          </Link>

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl px-3.5 py-2 transition-all cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-lime-400" />
              <span>NovaTech Labs</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {showOrgDropdown && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-2.5 space-y-1 z-50 text-xs font-semibold text-zinc-400">
                <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-600">
                  Manage Organization
                </div>
                <Link
                  href="/settings/organization"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Organization Settings
                </Link>
                <Link
                  href="/organization/departments"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <FolderGit2 className="h-4 w-4" />
                  Departments
                </Link>
                <Link
                  href="/organization/employees"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Employees
                </Link>
                <Link
                  href="/organization/workspaces"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  Workspaces
                </Link>
                <Link
                  href="/organization/governance"
                  onClick={() => setShowOrgDropdown(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Shield className="h-4 w-4 text-lime-400" />
                  Governance Center
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
          <Link href="/organization/governance" className="hover:text-white transition-colors py-1">
            Governance
          </Link>
          <Link href="/audit" className="hover:text-white transition-colors py-1">
            Audit
          </Link>
          <Link href="/builder" className="hover:text-white transition-colors py-1">
            Builder
          </Link>
          <Link href="/marketplace" className="hover:text-white transition-colors py-1">
            Marketplace
          </Link>
          <Link href="/results/demo" className="hover:text-white transition-colors py-1">
            Demo
          </Link>
        </div>

        {/* Right: Dynamic Auth Actions */}
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
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
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
