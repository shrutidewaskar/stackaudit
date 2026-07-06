export interface OptimizationAdviceSchema {
  recommendations: Array<{
    tool: string;
    action: string;
    saving: number;
    reason: string;
  }>;
}

export const validateOptimizationAdvice = (data: any): data is OptimizationAdviceSchema => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.recommendations) &&
    data.recommendations.every(
      (item: any) =>
        item &&
        typeof item === "object" &&
        typeof item.tool === "string" &&
        typeof item.action === "string" &&
        typeof item.saving === "number" &&
        typeof item.reason === "string"
    )
  );
};
