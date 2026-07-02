import type { AuditFormData } from "@/types/audit";
import type { AuditResult } from "@/types/results";

const AUDIT_KEY = "stackaudit.audit";
const RESULTS_KEY = "stackaudit.results";

function safeRead<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveAudit(audit: AuditFormData) {
  safeWrite(AUDIT_KEY, audit);
}

export function loadAudit() {
  return safeRead<AuditFormData>(AUDIT_KEY);
}

export function saveResults(result: AuditResult) {
  safeWrite(RESULTS_KEY, result);
}

export function loadResults() {
  return safeRead<AuditResult>(RESULTS_KEY);
}