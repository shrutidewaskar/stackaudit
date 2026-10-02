import { toolRegistry } from "./registry";
import { ToolResult, ToolAuditEvent } from "./types";

export class ToolGateway {
  private static MAX_TOOL_CALLS = 5;
  private static auditLogs: ToolAuditEvent[] = [];

  public static async execute(
    toolName: string,
    args: Record<string, any>,
    context: { orgId: string; userId: string; userRole: string; conversationId: string; callCount: number }
  ): Promise<ToolResult> {
    const startedAt = Date.now();
    const requestId = "req-tool-" + Math.random().toString(36).substring(2);

    // 1. Max call budget bound check
    if (context.callCount >= this.MAX_TOOL_CALLS) {
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: "FAILED",
        latencyMs: Date.now() - startedAt,
        resultSize: 0,
        errorCode: "BUDGET_EXHAUSTED"
      });
      return this.failResult("Tool invocation budget exhausted. Limit of 5 calls reached.");
    }

    // 2. Resolve registered tool
    const tool = toolRegistry.get(toolName);
    if (!tool) {
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: "FAILED",
        latencyMs: Date.now() - startedAt,
        resultSize: 0,
        errorCode: "UNKNOWN_TOOL"
      });
      return this.failResult(`Tool not found: ${toolName}`);
    }

    // 3. Organization Isolation boundary verification
    if (args.organizationId && args.organizationId !== context.orgId) {
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: "UNAUTHORIZED",
        latencyMs: Date.now() - startedAt,
        resultSize: 0,
        errorCode: "ORGANIZATION_VIOLATION"
      });
      return this.failResult("Security Violation: Unauthorized organization scope request.");
    }

    // 4. Role Permission checks
    const hasPermission = this.checkPermissions(context.userRole, tool.requiredPermissions);
    if (!hasPermission) {
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: "UNAUTHORIZED",
        latencyMs: Date.now() - startedAt,
        resultSize: 0,
        errorCode: "PERMISSION_DENIED"
      });
      return this.failResult(`Permission Denied: User role ${context.userRole} lacks permissions.`);
    }

    // 5. Execute
    try {
      const result = await tool.execute(args, { orgId: context.orgId, userId: context.userId });
      
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: result.success ? "SUCCESS" : "FAILED",
        latencyMs: Date.now() - startedAt,
        resultSize: JSON.stringify(result.data).length,
        errorCode: result.success ? undefined : "EXECUTION_ERROR"
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Internal Tool Error";
      this.logAudit({
        requestId,
        conversationId: context.conversationId,
        organizationId: context.orgId,
        userId: context.userId,
        toolName,
        timestamp: new Date().toISOString(),
        status: "FAILED",
        latencyMs: Date.now() - startedAt,
        resultSize: 0,
        errorCode: "CRITICAL_ERROR"
      });
      return this.failResult(msg);
    }
  }

  private static checkPermissions(userRole: string, required: string[]): boolean {
    if (userRole === "admin" || userRole === "Compliance Officer") return true;
    if (userRole === "viewer") {
      return !required.includes("ADMIN_GOVERNANCE");
    }
    return false;
  }

  private static logAudit(event: ToolAuditEvent): void {
    console.log(`[ToolGateway Audit] ${event.toolName} status: ${event.status} latency: ${event.latencyMs}ms`);
    this.auditLogs.push(event);
  }

  public static getAuditLogs(): ToolAuditEvent[] {
    return this.auditLogs;
  }

  public static clearAuditLogs(): void {
    this.auditLogs = [];
  }

  private static failResult(msg: string): ToolResult {
    return {
      success: false,
      data: {},
      sources: [],
      metadata: { generatedAt: new Date().toISOString(), dataCoverage: 0 },
      errors: [msg]
    };
  }
}
