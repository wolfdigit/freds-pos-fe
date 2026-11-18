import { AUTH_TOKEN_KEY } from '@/auth/runtimeConfig';

export interface SharedRequestOptions {
  /** true 時略過共用結果，直接重新查詢（重新整理按鈕用）。 */
  fresh?: boolean;
}

export interface SharedRequest<T> {
  get(options?: SharedRequestOptions): Promise<T>;
  /** 把一個已經送出的請求放進共用結果（例如登入時預讀的門市清單）。 */
  prime(token: string, startedAt: number, request: Promise<T>): void;
  invalidate(): void;
}

interface Entry<T> {
  token: string;
  startedAt: number;
  request: Promise<T>;
}

function currentToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

/**
 * 同一個 GET 在短時間內只打一次：進行中的請求直接共用，完成後在 ttlMs 內也共用結果。
 * 依登入 token 區分，換帳號不會拿到上一個人的結果；失敗的結果不保留。
 */
export function createSharedRequest<T>(fetcher: () => Promise<T>, ttlMs: number): SharedRequest<T> {
  let entry: Entry<T> | null = null;

  function store(next: Entry<T>): Promise<T> {
    entry = next;
    next.request.catch(() => {
      if (entry === next) entry = null;
    });
    return next.request;
  }

  return {
    get(options) {
      const token = currentToken();
      const cached = entry;
      if (
        options?.fresh !== true &&
        cached &&
        cached.token === token &&
        Date.now() - cached.startedAt < ttlMs
      ) {
        return cached.request;
      }
      return store({ token, startedAt: Date.now(), request: fetcher() });
    },
    prime(token, startedAt, request) {
      store({ token, startedAt, request });
    },
    invalidate() {
      entry = null;
    },
  };
}
