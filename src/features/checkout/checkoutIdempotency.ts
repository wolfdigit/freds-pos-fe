import type { CreateOrderPayload } from '@/types/checkout';

/**
 * 結帳的 X-Idempotency-Key 管理。
 *
 * 後端以「同 key + 同 body hash + 同收銀員」重放原本的 CheckoutReceipt，
 * 所以同一筆結帳（同購物車、同付款、同帳號、同門市）重送時一定要沿用同一把 key，
 * 否則逾時後重按結帳就會建立第二張單。
 *
 * key 存在 sessionStorage（只屬於這個分頁），重新整理頁面後只要購物車與付款內容一樣，
 * 仍會沿用同一把 key。內容一改就換新 key（後端不接受同 key 不同內容）。
 */
export const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = 'freds-pos-checkout-idempotency';

interface StoredAttempt {
  fingerprint: string;
  key: string;
}

export interface CheckoutAttemptScope {
  /** 目前購物車綁定的帳號，換人結帳就換 key。 */
  userId: string | null;
  /** 目前登入門市，換門市就換 key。 */
  storeName: string;
}

/** cyrb53：小而穩定的同步字串雜湊，只用來比對內容是否相同，不涉及安全。 */
function hashString(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function checkoutFingerprint(payload: CreateOrderPayload, scope: CheckoutAttemptScope): string {
  // payload 由同一段程式組出來，欄位順序固定，JSON.stringify 結果可直接比較。
  return hashString(JSON.stringify({ scope, payload }));
}

function newKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 非 secure context（例如區網 http）沒有 randomUUID，用 getRandomValues 組 v4 UUID。
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

let memoryAttempt: StoredAttempt | null = null;

function readStored(): StoredAttempt | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    if (!raw) return memoryAttempt;
    const parsed = JSON.parse(raw) as Partial<StoredAttempt>;
    if (typeof parsed.fingerprint === 'string' && typeof parsed.key === 'string' && parsed.key) {
      return { fingerprint: parsed.fingerprint, key: parsed.key };
    }
  } catch {
    // sessionStorage 不可用或內容損壞時退回記憶體。
  }
  return memoryAttempt;
}

function writeStored(attempt: StoredAttempt | null): void {
  memoryAttempt = attempt;
  try {
    if (attempt) {
      sessionStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, JSON.stringify(attempt));
    } else {
      sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    }
  } catch {
    // 只剩記憶體版本，仍可在同一頁面內防止重複送單。
  }
}

/** 同內容沿用既有 key；內容不同（新的一筆單）才產生新 key。 */
export function getOrCreateCheckoutKey(fingerprint: string): string {
  const current = readStored();
  if (current && current.fingerprint === fingerprint) return current.key;
  const key = newKey();
  writeStored({ fingerprint, key });
  return key;
}

/** 結帳成功、清空購物車或後端回報 key 衝突時呼叫，下一筆結帳會拿新 key。 */
export function clearCheckoutKey(): void {
  writeStored(null);
}
