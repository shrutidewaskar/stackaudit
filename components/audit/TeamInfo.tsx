"use client";

import { AuditFormData } from "@/types/audit";

interface Props {
  audit: AuditFormData;
  setAudit: React.Dispatch<React.SetStateAction<AuditFormData>>;
}

export default function TeamInfo({ audit, setAudit }: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">

      <h2 className="text-2xl font-semibold">
        Team Information
      </h2>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Team Size
        </label>

        <input
          type="number"
          value={audit.teamSize}
          onChange={(e) =>
            setAudit({
              ...audit,
              teamSize: Number(e.target.value),
            })
          }
          className="w-full rounded-xl border border-white/10 bg-black p-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Primary Use Case
        </label>

        <select
          value={audit.useCase}
          onChange={(e) =>
            setAudit({
              ...audit,
              useCase: e.target.value as AuditFormData["useCase"],
            })
          }
          className="w-full rounded-xl border border-white/10 bg-black p-3"
        >
          <option>Coding</option>
          <option>Writing</option>
          <option>Research</option>
          <option>Data Analysis</option>
          <option>Mixed</option>
        </select>
      </div>

    </div>
  );
}