import { supabase, isDevMockMode, assertSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";

export interface EnrollmentTokenRecord {
  id: string;
  organization_id: string;
  created_by: string;
  token_hash: string;
  name: string;
  status: "active" | "revoked" | "expired";
  expires_at: string;
  revoked_at?: string | null;
  revoked_by?: string | null;
  last_used_at?: string | null;
  created_at: string;
}

export const mockTokens = new Map<string, EnrollmentTokenRecord>();

export class EnrollmentTokenService {
  private static instance: EnrollmentTokenService;

  private constructor() {}

  public static getInstance(): EnrollmentTokenService {
    if (!EnrollmentTokenService.instance) {
      EnrollmentTokenService.instance = new EnrollmentTokenService();
    }
    return EnrollmentTokenService.instance;
  }

  /**
   * Generates a one-way SHA-256 hash of the raw token.
   */
  public hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Creates and stores a persistent, organization-bound enrollment token.
   * Returns the raw token ONCE for the client to store.
   */
  async createToken(
    organizationId: string,
    createdByUserId: string,
    name: string = "Browser Extension Device",
    expiresInDays: number = 30
  ): Promise<{ rawToken: string; record: EnrollmentTokenRecord }> {
    const rawToken = `stk_enroll_${crypto.randomBytes(32).toString("hex")}`;
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const record: EnrollmentTokenRecord = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      created_by: createdByUserId,
      token_hash: tokenHash,
      name,
      status: "active",
      expires_at: expiresAt,
      revoked_at: null,
      revoked_by: null,
      last_used_at: null,
      created_at: new Date().toISOString()
    };

    if (isDevMockMode()) {
      mockTokens.set(tokenHash, record);
      return { rawToken, record };
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("enrollment_tokens")
      .insert([{
        id: record.id,
        organization_id: record.organization_id,
        created_by: record.created_by,
        token_hash: record.token_hash,
        name: record.name,
        status: record.status,
        expires_at: record.expires_at,
        created_at: record.created_at
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database Error [enrollment_tokens.insert]: ${error.message}`);
    }

    return { rawToken, record: data };
  }

  /**
   * Validates a raw token against the server-side database.
   * Enforces status === 'active' and expires_at > now.
   * Updates last_used_at on successful verification.
   */
  async validateToken(rawToken: string): Promise<EnrollmentTokenRecord | null> {
    if (!rawToken || typeof rawToken !== "string") return null;

    const tokenHash = this.hashToken(rawToken);

    if (isDevMockMode()) {
      const record = mockTokens.get(tokenHash);
      if (!record) return null;

      if (record.status !== "active") return null;
      if (new Date(record.expires_at).getTime() < Date.now()) {
        record.status = "expired";
        return null;
      }

      record.last_used_at = new Date().toISOString();
      return record;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("enrollment_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Check status and expiration
    if (data.status !== "active") {
      return null;
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      // Mark as expired in DB
      await supabase
        .from("enrollment_tokens")
        .update({ status: "expired" })
        .eq("id", data.id);
      return null;
    }

    // Update last_used_at asynchronously
    supabase
      .from("enrollment_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id)
      .then(() => {});

    return data;
  }

  /**
   * Revokes an active token. Effective immediately on next request.
   */
  async revokeToken(tokenId: string, organizationId: string, revokedByUserId: string): Promise<boolean> {
    if (isDevMockMode()) {
      for (const [hash, record] of mockTokens.entries()) {
        if (record.id === tokenId && record.organization_id === organizationId) {
          record.status = "revoked";
          record.revoked_at = new Date().toISOString();
          record.revoked_by = revokedByUserId;
          return true;
        }
      }
      return false;
    }

    assertSupabaseConfigured();
    const { error } = await supabase
      .from("enrollment_tokens")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: revokedByUserId
      })
      .eq("id", tokenId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(`Database Error [enrollment_tokens.revoke]: ${error.message}`);
    }

    return true;
  }

  /**
   * Lists enrollment tokens for an organization (admin/owner view). Never returns raw tokens or hashes.
   */
  async listTokens(organizationId: string): Promise<Omit<EnrollmentTokenRecord, "token_hash">[]> {
    if (isDevMockMode()) {
      const list: Omit<EnrollmentTokenRecord, "token_hash">[] = [];
      for (const record of mockTokens.values()) {
        if (record.organization_id === organizationId) {
          const { token_hash, ...safeRecord } = record;
          list.push(safeRecord);
        }
      }
      return list;
    }

    assertSupabaseConfigured();
    const { data, error } = await supabase
      .from("enrollment_tokens")
      .select("id, organization_id, created_by, name, status, expires_at, revoked_at, revoked_by, last_used_at, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Database Error [enrollment_tokens.list]: ${error.message}`);
    }

    return data || [];
  }
}

export const enrollmentTokenService = EnrollmentTokenService.getInstance();
