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

function detailItemText(item: unknown): string {
  if (typeof item === 'string') return item.trim();
  if (!item || typeof item !== 'object') return '';
  const msg = (item as { msg?: unknown }).msg;
  return typeof msg === 'string' ? msg.trim() : '';
}

function flattenErrorMap(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const parts: string[] = [];
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) parts.push(value.trim());
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) parts.push(item.trim());
      }
    }
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

/** Validation failures may be `{ message }`, a string `detail`, FastAPI `detail[]`, or an `errors` map. */
export function readValidationMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (typeof record.detail === 'string' && record.detail.trim()) return record.detail.trim();
  if (Array.isArray(record.detail)) {
    const parts = record.detail.map(detailItemText).filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
  }
  return flattenErrorMap(record.errors);
}

function errorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;
  const code = (err as { code?: unknown }).code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
}

function isGenericApiMessage(message: string): boolean {
  return (
    message.startsWith('API 請求失敗') ||
    message.startsWith('API 端點不存在') ||
    message.startsWith('權限不足或未授權') ||
    message.startsWith('伺服器內部錯誤') ||
    message.startsWith('無法連線至 API') ||
    message.startsWith('API 請求逾時')
  );
}

/** Backend message plus code, preferring a validation body over a generic HTTP wrapper. */
export function errorDetail(err: unknown, fallback: string): string {
  const body =
    err && typeof err === 'object' && 'responseBody' in err
      ? (err as { responseBody?: unknown }).responseBody
      : undefined;
  const fromBody = readValidationMessage(body);
  const code = errorCode(err) ?? readBusinessError(body).code;
  let message = err instanceof Error && err.message.trim() ? err.message.trim() : '';
  if (fromBody && (!message || isGenericApiMessage(message))) message = fromBody;
  if (message && code && !message.includes(code)) return `${message}（${code}）`;
  if (message) return message;
  if (code) return `${fallback}（${code}）`;
  return fallback;
}
