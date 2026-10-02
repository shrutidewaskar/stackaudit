import { toolRegistry } from "./registry";
import { GetGovernanceScoreTool } from "./governance/getGovernanceScore";
import { GetGovernanceFindingsTool } from "./governance/getGovernanceFindings";
import { GetGovernanceTrendsTool } from "./governance/getGovernanceTrends";
import { GetUsageSummaryTool } from "./usage/getUsageSummary";
import { GetDepartmentUsageTool } from "./usage/getDepartmentUsage";
import { GetToolUsageTool } from "./usage/getToolUsage";
import { GetLatestReportTool } from "./reports/getLatestReport";
import { GetWorkspacesTool } from "./organization/getWorkspaces";
import { GetDepartmentsTool } from "./organization/getDepartments";

// Register all read-only tools in the central tool registry
export function registerAllTools(): void {
  toolRegistry.clear();
  toolRegistry.register(new GetGovernanceScoreTool());
  toolRegistry.register(new GetGovernanceFindingsTool());
  toolRegistry.register(new GetGovernanceTrendsTool());
  toolRegistry.register(new GetUsageSummaryTool());
  toolRegistry.register(new GetDepartmentUsageTool());
  toolRegistry.register(new GetToolUsageTool());
  toolRegistry.register(new GetLatestReportTool());
  toolRegistry.register(new GetWorkspacesTool());
  toolRegistry.register(new GetDepartmentsTool());
}

// Automatically register on load
registerAllTools();
