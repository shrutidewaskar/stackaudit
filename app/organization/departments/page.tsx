"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FolderGit2, Plus, User, FileText, Trash2 } from "lucide-react";

interface Dept {
  id: string;
  name: string;
  description: string;
  head: string;
  count: number;
}

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Dept[]>([
    { id: "dept-eng", name: "Engineering", description: "Product coding and systems development", head: "Shruti Dewaskar", count: 48 },
    { id: "dept-des", name: "Design", description: "UI/UX planning and graphic design", head: "Alice Smith", count: 24 },
    { id: "dept-mkt", name: "Marketing", description: "SEO, growth campaigns, and content branding", head: "Bob Jones", count: 18 },
    { id: "dept-fin", name: "Finance", description: "Budget operations and investment analysis", head: "Charlie Brown", count: 12 },
    { id: "dept-ops", name: "Operations", description: "Office systems, HR tools, and workflow logs", head: "Diana Prince", count: 18 }
  ]);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [head, setHead] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newDept: Dept = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      description: desc.trim(),
      head: head.trim() || "Unassigned",
      count: 0
    };
    setDepts([...depts, newDept]);
    setName("");
    setDesc("");
    setHead("");
  };

  const handleDelete = (id: string) => {
    setDepts(depts.filter((d) => d.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-6 py-16 space-y-8 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Departments</h1>
              <p className="text-zinc-400 text-xs mt-1">Organize company structures and audit budgets by team divisions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="md:col-span-2 space-y-4">
            {depts.map((d) => (
              <div key={d.id} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">{d.name}</h3>
                    <span className="text-[10px] font-black uppercase bg-zinc-800 border border-white/5 text-zinc-400 px-2 py-0.5 rounded-full">
                      {d.count} Members
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-md leading-relaxed">{d.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase mt-2">
                    <User className="h-3.5 w-3.5" />
                    Head: {d.head}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Department Form */}
          <div>
            <form onSubmit={handleAdd} className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create Department</h3>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Department Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Description</label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Short description..."
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Department Head</label>
                  <input
                    type="text"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    placeholder="Head name..."
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 px-4 py-3 text-xs font-bold text-black transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
