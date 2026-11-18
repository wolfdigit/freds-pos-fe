import { readAuthToken } from '@/auth/runtimeConfig';
import { authApi } from '@/services/api/httpAuthService';
import type { StoreDto } from '@/types/system';

/**
 * 重新開啟頁面時，/auth/me 與 /auth/stores 同時送出，不必等 /auth/me 回來才讀門市清單。
 *
 * 登入判斷仍只看 /auth/me：預先讀到的門市清單只在 /auth/me 確認 session 有效、
 * 而且 token 沒換過時才會被用掉。/auth/me 失敗或 token 改變時直接丟掉，
 * 401 也不會觸發任何登出流程（authApi 的請求都略過全域 auth handler）。
 */
interface StorePrefetch {
  token: string;
  startedAt: number;
  request: Promise<StoreDto[]>;
}

/** 預讀結果只在啟動當下有用，放太久就不再沿用。 */
const PREFETCH_MAX_AGE_MS = 30_000;

let pending: StorePrefetch | null = null;

export function prefetchLoginStores(): void {
  const token = readAuthToken();
  if (!token) {
    pending = null;
    return;
  }
  const request = authApi.listStores();
  // 沒被用到的預讀失敗不應變成 unhandled rejection。
  request.catch(() => undefined);
  pending = { token, startedAt: Date.now(), request };
}

export function discardLoginStoresPrefetch(): void {
  pending = null;
}

/** 取用一次預讀結果；沒有預讀或 token 已改變就回傳 null。 */
export function takeLoginStoresPrefetch(): Promise<StoreDto[]> | null {
  const current = pending;
  pending = null;
  if (!current || current.token !== readAuthToken()) return null;
  if (Date.now() - current.startedAt > PREFETCH_MAX_AGE_MS) return null;
  return current.request;
}

/** 讀門市清單：優先用預讀結果，否則照常呼叫 /auth/stores。 */
export function loadLoginStores(): Promise<StoreDto[]> {
  return takeLoginStoresPrefetch() ?? authApi.listStores();
}
