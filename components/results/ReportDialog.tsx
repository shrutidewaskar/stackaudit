"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headline: string;
  description: string;
  auditId?: string;
}

const roleOptions = [
  "Founder",
  "Operator",
  "Engineering Manager",
  "Product Manager",
  "Finance",
  "Other",
];

const teamSizes = ["1", "2-5", "6-15", "16-50", "50+"];

export default function ReportDialog({
  open,
  onOpenChange,
  headline,
  description,
  auditId,
}: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0 && !isLoading, [email, isLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!auditId) {
      setError("No audit ID provided.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: email.trim(),
          company: company.trim() || null,
          role: role || null,
          teamSize: teamSize || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save your information");
        setIsLoading(false);
        return;
      }

      setSaved(true);
      window.setTimeout(() => {
        setSaved(false);
        onOpenChange(false);
        // Reset form
        setEmail("");
        setCompany("");
        setRole("");
        setTeamSize("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-zinc-950 text-white shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{headline}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="report-email" className="text-sm font-medium text-zinc-300">
              Email <span className="text-rose-400">*</span>
            </label>
            <Input
              id="report-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              aria-invalid={Boolean(error)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              disabled={isLoading}
              required
            />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="report-company" className="text-sm font-medium text-zinc-300">
                Company
              </label>
              <Input
                id="report-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Acme Inc."
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Role</label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Team Size</label>
            <Select value={teamSize} onValueChange={setTeamSize} disabled={isLoading}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                {teamSizes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {saved ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              ✓ Report saved successfully. Check your email for details.
            </div>
          ) : null}

          <DialogFooter className="border-white/10 bg-white/5">
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 md:w-auto"
              disabled={!canSubmit}
            >
              {isLoading ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
