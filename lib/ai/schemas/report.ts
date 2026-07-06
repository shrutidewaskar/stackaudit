export interface ExecutiveReportSchema {
  title: string;
  grade: string;
  recommendationsCount: number;
  topOpportunity: string;
}

export const validateExecutiveReport = (data: any): data is ExecutiveReportSchema => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.title === "string" &&
    typeof data.grade === "string" &&
    typeof data.recommendationsCount === "number" &&
    typeof data.topOpportunity === "string"
  );
};
