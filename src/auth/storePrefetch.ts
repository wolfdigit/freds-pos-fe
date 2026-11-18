import { readAuthToken } from '@/auth/runtimeConfig';
import { authApi } from '@/services/api/httpAuthService';
import { createSharedRequest, type SharedRequestOptions } from '@/services/api/sharedRequest';
import type { StoreDto } from '@/types/system';

/**
 * 登入門市清單（/auth/stores）。
 *
 * 1. 重新開啟頁面時，/auth/stores 與 /auth/me 同時送出（預讀）。
 * 2. 登入判斷仍只看 /auth/me：預讀結果先放在 pending，只有 restore 確認 /auth/me
 *    成功、token 沒換過、而且在 PREFETCH_MAX_AGE_MS 內，才會被 adopt 成共用結果。
 *    /auth/me 失敗或 token 改變時直接丟掉；401 也不會觸發登出流程（authApi 略過全域 auth handler）。
 * 3. 採用後，App、Header、sessionStore、選門市畫面在 LOGIN_STORES_TTL_MS 內共用同一份結果，
 *    不會在預讀完成後又各自重抓。重新整理／重試按鈕用 fresh 直接重查；門市有寫入時作廢。
 */
interface StorePrefetch {
  token: string;
  startedAt: number;
  request: Promise<StoreDto[]>;
}

/** 預讀結果只在啟動當下有用，放太久就不再沿用。 */
const PREFETCH_MAX_AGE_MS = 30_000;
/** 採用後的共用時間。 */
export const LOGIN_STORES_TTL_MS = 30_000;

const loginStores = createSharedRequest<StoreDto[]>(() => authApi.listStores(), LOGIN_STORES_TTL_MS);

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

/**
 * 只在 /auth/me 成功後呼叫：把同一個 token 的預讀結果變成共用結果。
 * token 已改變或預讀太舊就丟掉，之後照常向後端查詢。
 */
export function adoptLoginStoresPrefetch(): void {
  const current = pending;
  pending = null;
  if (!current || current.token !== readAuthToken()) return;
  if (Date.now() - current.startedAt > PREFETCH_MAX_AGE_MS) return;
  loginStores.prime(current.token, current.startedAt, current.request);
}

/** 測試用：取出尚未被採用的預讀。 */
export function takeLoginStoresPrefetch(): Promise<StoreDto[]> | null {
  const current = pending;
  pending = null;
  if (!current || current.token !== readAuthToken()) return null;
  if (Date.now() - current.startedAt > PREFETCH_MAX_AGE_MS) return null;
  return current.request;
}

/** 門市新增、改綁、刪除或登入狀態結束時呼叫。 */
export function invalidateLoginStores(): void {
  pending = null;
  loginStores.invalidate();
}

/** 讀門市清單：短時間內共用；fresh 直接重新查詢。 */
export function loadLoginStores(options?: SharedRequestOptions): Promise<StoreDto[]> {
  return loginStores.get(options);
}
