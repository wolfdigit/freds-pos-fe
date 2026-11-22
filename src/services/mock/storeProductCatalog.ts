import type { StoreDto } from '@/types/system';
import { storeProductScope } from '@/types/system';

/** Mock 的門市商品清單：storeName -> 清單列。對應後端 store_product。 */
export const STORE_PRODUCTS_STORAGE_KEY = 'FREDS_POS_STORE_PRODUCTS';

export interface MockStoreProductRow {
  productId: string;
  createdAt: string;
  createdBy: string;
}

export type MockStoreProducts = Record<string, MockStoreProductRow[]>;

export function readStoreProducts(): MockStoreProducts {
  const raw = localStorage.getItem(STORE_PRODUCTS_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as MockStoreProducts;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeStoreProducts(value: MockStoreProducts): void {
  localStorage.setItem(STORE_PRODUCTS_STORAGE_KEY, JSON.stringify(value));
}

export function listedProductIds(storeName: string): Set<string> {
  return new Set((readStoreProducts()[storeName] ?? []).map((row) => row.productId));
}

/** 跟後端 soldInLoginStore 同一個定義：沒有門市 null；all 門市 true；list 門市看清單。 */
export function soldInStore(store: StoreDto | null, productId: string, listed?: Set<string>): boolean | null {
  if (!store) return null;
  if (storeProductScope(store) !== 'list') return true;
  return (listed ?? listedProductIds(store.name)).has(productId);
}

/** 加入清單（已在清單的略過），回新增筆數。 */
export function addListedProducts(storeName: string, productIds: string[], actor: string): number {
  const all = readStoreProducts();
  const rows = all[storeName] ?? [];
  const existing = new Set(rows.map((row) => row.productId));
  const now = new Date().toISOString();
  const added = Array.from(new Set(productIds)).filter((id) => !existing.has(id));
  all[storeName] = [...rows, ...added.map((productId) => ({ productId, createdAt: now, createdBy: actor }))];
  writeStoreProducts(all);
  return added.length;
}

export function removeListedProducts(storeName: string, productIds: string[]): number {
  const all = readStoreProducts();
  const rows = all[storeName] ?? [];
  const remove = new Set(productIds);
  const kept = rows.filter((row) => !remove.has(row.productId));
  all[storeName] = kept;
  writeStoreProducts(all);
  return rows.length - kept.length;
}

export function deleteStoreList(storeName: string): void {
  const all = readStoreProducts();
  delete all[storeName];
  writeStoreProducts(all);
}
