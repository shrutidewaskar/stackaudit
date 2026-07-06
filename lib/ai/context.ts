export const buildAuditContext = (input: {
  teamSize: number;
  useCase: string;
  tools: Array<{ name: string; seats: number; priceMonthly: number }>;
}): string => {
  const toolsList = input.tools
    .map((t) => `- ${t.name}: ${t.seats} seats at $${t.priceMonthly}/mo`)
    .join("\n");

  return `Team Size: ${input.teamSize}\nPrimary Use Case: ${input.useCase}\nTools List:\n${toolsList}`;
};

export const buildReportContext = (input: {
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  optimizationScore: number;
  recommendationsCount: number;
}): string => {
  return `Monthly Savings Potential: $${input.totalSavingsMonthly}\nAnnual Savings Potential: $${input.totalSavingsAnnual}\nOptimization Score: ${input.optimizationScore}/100\nRecommendations Count: ${input.recommendationsCount}`;
};

export const buildChatContext = (input: {
  query: string;
  history?: Array<{ role: string; message: string }>;
}): string => {
  const historyText = input.history
    ? input.history.map((h) => `${h.role}: ${h.message}`).join("\n")
    : "No previous history.";

  return `User Query: ${input.query}\nChat History:\n${historyText}`;
};

export const buildProcurementContext = (input: {
  toolName: string;
  currentPlan: string;
  volumeSize: number;
}): string => {
  return `Tool: ${input.toolName}\nCurrent Plan: ${input.currentPlan}\nVolume / Seats Count: ${input.volumeSize}`;
};

export const buildOptimizationContext = (input: {
  toolName: string;
  seatCount: number;
  overlapTools: string[];
}): string => {
  return `Target Tool: ${input.toolName}\nSeat Count: ${input.seatCount}\nOverlap/Redundant Tools: ${input.overlapTools.join(", ")}`;
};
