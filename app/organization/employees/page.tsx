"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Search, Plus, UserPlus, Trash2 } from "lucide-react";

interface EmployeeMock {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: "active" | "inactive" | "on_leave";
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeMock[]>([
    { id: "emp-1", name: "John Doe", email: "john@novatech.com", jobTitle: "Frontend Developer", department: "Engineering", status: "active" },
    { id: "emp-2", name: "Jane Smith", email: "jane@novatech.com", jobTitle: "UI Designer", department: "Design", status: "active" },
    { id: "emp-3", name: "Alex Jones", email: "alex@novatech.com", jobTitle: "Growth Marketer", department: "Marketing", status: "active" },
    { id: "emp-4", name: "Emily Brown", email: "emily@novatech.com", jobTitle: "Financial Analyst", department: "Finance", status: "active" },
    { id: "emp-5", name: "Michael Miller", email: "michael@novatech.com", jobTitle: "Operations Analyst", department: "Operations", status: "on_leave" }
  ]);

  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const handleDelete = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black">
      <Navbar />

      <main className="flex-grow mx-auto w-full max-w-4xl px-6 py-16 space-y-8 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-lime-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Employee Directory</h1>
              <p className="text-zinc-400 text-xs mt-1">Audit active accounts, seat mapping configurations, and department alignments.</p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl bg-zinc-900 border border-white/5 pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500/35 font-semibold"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-200 px-5 py-3 text-xs font-bold text-black transition-colors">
            <UserPlus className="h-4 w-4" />
            Invite Employee
          </button>
        </div>

        {/* Directory List */}
        <div className="p-6 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-xs text-left">
              <thead>
                <tr className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-semibold">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="text-white font-bold">{e.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{e.email}</div>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] border border-white/5 text-zinc-400">
                        {e.department}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">{e.jobTitle}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 transition-all active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
