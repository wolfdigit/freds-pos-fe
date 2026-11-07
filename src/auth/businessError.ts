export interface BusinessErrorBody {
  code: string | null;
  message: string | null;
}

/** Backend business failures are `{ code, message }`. Validation errors use a different shape and are not treated as session errors. */
export function readBusinessError(body: unknown): BusinessErrorBody {
  if (!body || typeof body !== 'object') return { code: null, message: null };
  const record = body as Record<string, unknown>;
  return {
    code: typeof record.code === 'string' ? record.code : null,
    message: typeof record.message === 'string' ? record.message : null,
  };
}

export const SESSION_END_CODES = [
  'AUTH_REQUIRED',
  'AUTH_SESSION_EXPIRED',
  'AUTH_SESSION_REVOKED',
  'AUTH_ACCOUNT_NOT_ALLOWED',
] as const;

export function isSessionEnd(status: number, code: string | null): boolean {
  if (status !== 401 || !code) return false;
  if (code === 'AUTH_INVALID_CREDENTIAL') return false;
  return (SESSION_END_CODES as readonly string[]).includes(code);
}

export function isSessionEndError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const record = err as { status?: unknown; code?: unknown };
  const status = typeof record.status === 'number' ? record.status : 0;
  const code = typeof record.code === 'string' ? record.code : null;
  return isSessionEnd(status, code);
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
