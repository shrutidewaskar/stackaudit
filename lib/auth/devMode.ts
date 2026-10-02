export interface AuthUser {
  id: string;
  email: string;
}

export function isExplicitDevMode(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.ALLOW_DEV_AUTH_BYPASS === "true" ||
    process.env.ENABLE_DEV_MOCK_AUTH === "true"
  );
}
