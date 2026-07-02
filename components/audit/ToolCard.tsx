"use client";

import { ToolEntry } from "@/types/audit";
import supportedTools from "@/data/tools";

interface Props {
  tool: ToolEntry;
  updateTool: (tool: ToolEntry) => void;
  removeTool: () => void;
}

export default function ToolCard({
  tool,
  updateTool,
  removeTool,
}: Props) {
  const plans =
    supportedTools[
      tool.tool as keyof typeof supportedTools
    ] || [];

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          AI Tool
        </h2>

        <button
          onClick={removeTool}
          className="text-red-400 hover:text-red-300"
        >
          Remove
        </button>
      </div>

      <select
        value={tool.tool}
        onChange={(e) =>
          updateTool({
            ...tool,
            tool: e.target.value,
            plan: "",
          })
        }
        className="w-full rounded-xl border border-white/10 bg-black p-3"
      >
        <option value="">Select Tool</option>

        {Object.keys(supportedTools).map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>

      <select
        value={tool.plan}
        onChange={(e) =>
          updateTool({
            ...tool,
            plan: e.target.value,
          })
        }
        className="w-full rounded-xl border border-white/10 bg-black p-3"
      >
        <option value="">Select Plan</option>

        {plans.map((plan) => (
          <option key={plan}>{plan}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Monthly Spend ($)"
        value={tool.monthlySpend}
        onChange={(e) =>
          updateTool({
            ...tool,
            monthlySpend: Number(e.target.value),
          })
        }
        className="w-full rounded-xl border border-white/10 bg-black p-3"
      />

      <input
        type="number"
        placeholder="Seats"
        value={tool.seats}
        onChange={(e) =>
          updateTool({
            ...tool,
            seats: Number(e.target.value),
          })
        }
        className="w-full rounded-xl border border-white/10 bg-black p-3"
      />
    </div>
  );
}