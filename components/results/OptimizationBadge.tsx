import { cn } from "@/lib/utils";

type BadgeTone =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "high"
  | "medium"
  | "low";

interface Props {
  tone: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  excellent: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  good: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
  fair: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  poor: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
  high: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
  medium: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  low: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
};

export default function OptimizationBadge({
  tone,
  children,
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}