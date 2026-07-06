export interface ProcurementAdviceSchema {
  answer: string;
  comparisons: string[];
}

export const validateProcurementAdvice = (data: any): data is ProcurementAdviceSchema => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.answer === "string" &&
    Array.isArray(data.comparisons) &&
    data.comparisons.every((item: any) => typeof item === "string")
  );
};
