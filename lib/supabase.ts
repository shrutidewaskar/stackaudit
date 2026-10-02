import { createClient, SupabaseClient } from "@supabase/supabase-js";

const PLACEHOLDER_URLS = ["https://placeholder.supabase.co", ""];
const PLACEHOLDER_KEYS = ["placeholder-key", ""];

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

/**
 * Returns true only when valid, non-placeholder Supabase configuration credentials are provided.
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return false;
  if (PLACEHOLDER_URLS.includes(url)) return false;
  if (PLACEHOLDER_KEYS.includes(key)) return false;
  return true;
}

/**
 * Asserts that Supabase is properly configured.
 * In production or real mode, throws a descriptive error if missing or placeholder credentials are used.
 */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Database Configuration Error: Valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for real database operations."
    );
  }
}

/**
 * Centralized check for explicit development mock persistence mode.
 * Real production operations will NEVER fall back to in-memory mocks on database errors.
 */
export function isDevMockMode(): boolean {
  return (
    process.env.DEV_MOCK_MODE === "true" ||
    process.env.ENABLE_DEV_MOCK_AUTH === "true" ||
    process.env.NODE_ENV === "test"
  );
}

// Universal client instance (dynamic proxy to ensure runtime env vars are utilized)
let _client: SupabaseClient | null = null;
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      _client = createClient(
        getSupabaseUrl() || "https://placeholder.supabase.co",
        getSupabaseAnonKey() || "placeholder-key"
      );
    }
    return (_client as any)[prop];
  }
});