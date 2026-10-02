"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Save, Globe, Lock, Shield } from "lucide-react";

export default function OrgSettingsPage() {
  const [org, setOrg] = useState({
    name: "NovaTech Labs",
    slug: "novatech-labs",
    industry: "Software Engineering & AI Research",
    company_size: 120,
    plan: "enterprise"
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Organization settings updated successfully.");
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-6 py-16 space-y-8 font-sans">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Organization Settings</h1>
            <p className="text-zinc-400 text-xs mt-1">Configure your corporate account details and plans.</p>
          </div>
        </div>

        {/* Settings Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profile Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">URL Slug</label>
                  <input
                    type="text"
                    value={org.slug}
                    onChange={(e) => setOrg({ ...org, slug: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Industry</label>
                  <input
                    type="text"
                    value={org.industry}
                    onChange={(e) => setOrg({ ...org, industry: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Seats / Size</label>
                  <input
                    type="number"
                    value={org.company_size}
                    onChange={(e) => setOrg({ ...org, company_size: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Subscription Plan</label>
                  <input
                    type="text"
                    value={org.plan}
                    disabled
                    className="w-full rounded-xl bg-zinc-900/50 border border-white/5 px-4 py-3 text-xs text-zinc-500 font-bold uppercase tracking-wider select-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 hover:bg-lime-300 px-6 py-3.5 text-xs font-bold text-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving Settings..." : "Save Settings"}
            </button>
          </div>

          {/* Quick Stats sidebar info */}
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subscription & Policy</h3>
              <div className="flex gap-3.5 items-start">
                <Shield className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Enterprise Tier Active</div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    Custom models enabled, RLS workspace boundaries enforced, and dedicated support active.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
