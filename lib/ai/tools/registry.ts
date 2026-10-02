import { ToolDefinition } from "./types";

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  public register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Overwriting already registered tool: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ToolDefinition | null {
    return this.tools.get(name) || null;
  }

  public list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public has(name: string): boolean {
    return this.tools.has(name);
  }

  public clear(): void {
    this.tools.clear();
  }
}

export const toolRegistry = new ToolRegistry();
