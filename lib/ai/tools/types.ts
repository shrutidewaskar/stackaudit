export type ToolCategory = "GOVERNANCE" | "USAGE" | "REPORTS" | "ORGANIZATION";

export type UserPermission =
  | "VIEW_GOVERNANCE"
  | "VIEW_USAGE"
  | "VIEW_REPORTS"
  | "VIEW_ORGANIZATION"
  | "ADMIN_GOVERNANCE";

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  requiredPermissions: UserPermission[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  execute(args: Record<string, any>, context: { orgId: string; userId: string }): Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data: Record<string, any>;
  sources: { sourceType: string; sourceId: string }[];
  metadata: {
    generatedAt: string;
    dataCoverage: number;
  };
  errors?: string[];
}

export interface ToolAuditEvent {
  requestId: string;
  conversationId: string;
  organizationId: string;
  userId: string;
  toolName: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "UNAUTHORIZED";
  latencyMs: number;
  resultSize: number;
  errorCode?: string;
}
