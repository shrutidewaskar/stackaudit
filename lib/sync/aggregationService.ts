import { UsageEvent } from "../usage/types/types";
import { DailyUsage, EmployeeUsageDaily } from "./types";
import { mockUsageEventsDB } from "./ingestionService";
import { supabase } from "@/lib/supabase";

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// Fallback in-memory stores for aggregations
export const mockDailyUsageDB: DailyUsage[] = [];
export const mockEmployeeUsageDailyDB: EmployeeUsageDaily[] = [];

export class AggregationService {
  public static async aggregateDaily(orgId: string, dateStr: string): Promise<void> {
    // 1. Fetch raw events matching orgId and date
    let events: UsageEvent[] = [];

    if (!isSupabaseConfigured) {
      events = mockUsageEventsDB.filter(
        (e) => e.organizationId === orgId && e.sessionStart.startsWith(dateStr)
      );
    } else {
      try {
        const { data, error } = await supabase
          .from("usage_events")
          .select("*")
          .eq("organization_id", orgId)
          .gte("session_start", `${dateStr}T00:00:00Z`)
          .lte("session_start", `${dateStr}T23:59:59Z`);
        
        if (error) throw error;
        events = (data || []).map((row) => ({
          eventId: row.event_id,
          organizationId: row.organization_id,
          employeeId: row.employee_id,
          workspaceId: row.workspace_id,
          connectorId: row.connector_id,
          provider: row.provider,
          tool: row.tool,
          source: row.source,
          domain: row.domain,
          sessionStart: row.session_start,
          sessionEnd: row.session_end,
          activeDuration: row.active_duration,
          idleDuration: row.idle_duration,
          tabVisibility: row.tab_visibility,
          device: row.device,
          browser: row.browser,
          createdAt: row.created_at,
          metadata: row.metadata
        }));
      } catch {
        events = mockUsageEventsDB.filter(
          (e) => e.organizationId === orgId && e.sessionStart.startsWith(dateStr)
        );
      }
    }

    if (events.length === 0) return;

    // Grouping by key: provider + tool
    const groups = new Map<string, UsageEvent[]>();
    events.forEach((ev) => {
      const key = `${ev.provider}:${ev.tool}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(ev);
    });

    for (const [key, list] of groups.entries()) {
      const [provider, tool] = key.split(":");
      const uniqueUsers = new Set(list.map((e) => e.employeeId));
      
      let totalActiveSecs = 0;
      let totalIdleSecs = 0;
      let lastActivity: Date | null = null;

      list.forEach((e) => {
        totalActiveSecs += e.activeDuration;
        totalIdleSecs += e.idleDuration;
        const start = new Date(e.sessionStart);
        if (!lastActivity || start > lastActivity) {
          lastActivity = start;
        }
      });

      const totalSecs = totalActiveSecs + totalIdleSecs;

      const daily: DailyUsage = {
        id: `daily-${orgId}-${dateStr}-${provider}-${tool}`,
        organizationId: orgId,
        date: dateStr,
        provider,
        tool,
        departmentId: "dept-eng", // Default engineering link for seed
        activeUsers: uniqueUsers.size,
        sessions: list.length,
        activeMinutes: Math.round((totalActiveSecs / 60) * 10) / 10,
        idleMinutes: Math.round((totalIdleSecs / 60) * 10) / 10,
        totalMinutes: Math.round((totalSecs / 60) * 10) / 10,
        averageSessionMinutes: Math.round(((totalSecs / list.length) / 60) * 10) / 10,
        lastActivityAt: lastActivity ? (lastActivity as Date).toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!isSupabaseConfigured) {
        mockDailyUsageDB.push(daily);
      } else {
        try {
          const { error } = await supabase.from("daily_usage").upsert({
            organization_id: daily.organizationId,
            date: daily.date,
            provider: daily.provider,
            tool: daily.tool,
            department_id: daily.departmentId,
            active_users: daily.activeUsers,
            sessions: daily.sessions,
            active_minutes: daily.activeMinutes,
            idle_minutes: daily.idleMinutes,
            total_minutes: daily.totalMinutes,
            average_session_minutes: daily.averageSessionMinutes,
            last_activity_at: daily.lastActivityAt
          });
          if (error) throw error;
        } catch {
          mockDailyUsageDB.push(daily);
        }
      }
    }

    // Grouping by Employee + Provider + Tool
    const empGroups = new Map<string, UsageEvent[]>();
    events.forEach((ev) => {
      const key = `${ev.employeeId}:${ev.provider}:${ev.tool}`;
      if (!empGroups.has(key)) empGroups.set(key, []);
      empGroups.get(key)!.push(ev);
    });

    for (const [key, list] of empGroups.entries()) {
      const [empId, provider, tool] = key.split(":");
      let actSecs = 0;
      let idlSecs = 0;
      let lastAct: Date | null = null;

      list.forEach((e) => {
        actSecs += e.activeDuration;
        idlSecs += e.idleDuration;
        const start = new Date(e.sessionStart);
        if (!lastAct || start > lastAct) lastAct = start;
      });

      const empDaily: EmployeeUsageDaily = {
        id: `emp-daily-${orgId}-${empId}-${dateStr}-${provider}-${tool}`,
        organizationId: orgId,
        employeeId: empId,
        departmentId: "dept-eng",
        date: dateStr,
        provider,
        tool,
        sessions: list.length,
        activeMinutes: Math.round((actSecs / 60) * 10) / 10,
        idleMinutes: Math.round((idlSecs / 60) * 10) / 10,
        lastActivityAt: lastAct ? (lastAct as Date).toISOString() : null,
        createdAt: new Date().toISOString()
      };

      if (!isSupabaseConfigured) {
        mockEmployeeUsageDailyDB.push(empDaily);
      } else {
        try {
          const { error } = await supabase.from("employee_usage_daily").upsert({
            organization_id: empDaily.organizationId,
            employee_id: empDaily.employeeId,
            department_id: empDaily.departmentId,
            date: empDaily.date,
            provider: empDaily.provider,
            tool: empDaily.tool,
            sessions: empDaily.sessions,
            active_minutes: empDaily.activeMinutes,
            idle_minutes: empDaily.idleMinutes,
            last_activity_at: empDaily.lastActivityAt
          });
          if (error) throw error;
        } catch {
          mockEmployeeUsageDailyDB.push(empDaily);
        }
      }
    }
  }
}
