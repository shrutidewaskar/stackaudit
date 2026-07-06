export interface AuditSummarySchema {
  summary: string;
  score: number;
  savingsMonthly: number;
  savingsAnnual: number;
}

export const validateAuditSummary = (data: any): data is AuditSummarySchema => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.summary === "string" &&
    typeof data.score === "number" &&
    typeof data.savingsMonthly === "number" &&
    typeof data.savingsAnnual === "number"
  );
};
