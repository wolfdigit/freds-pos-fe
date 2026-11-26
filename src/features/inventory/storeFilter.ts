import type { ProductStoreScope } from '@/types/product';
import { storeProductScope, type StoreDto, type StoreProductScope } from '@/types/system';

/** 庫存頁表頭的門市篩選：某間門市的可售商品清單，或全部商品。 */
export type InventoryStoreFilter = { kind: 'store'; storeName: string } | { kind: 'all' };

export const ALL_PRODUCTS_FILTER: InventoryStoreFilter = { kind: 'all' };

export interface StoreFilterButton {
  key: string;
  label: string;
  filter: InventoryStoreFilter;
}

/** 預設：目前登入門市；沒有登入門市（管理員）時是全部商品。 */
export function defaultStoreFilter(loginStoreName: string): InventoryStoreFilter {
  const name = loginStoreName.trim();
  return name ? { kind: 'store', storeName: name } : ALL_PRODUCTS_FILTER;
}

export function sameStoreFilter(a: InventoryStoreFilter, b: InventoryStoreFilter): boolean {
  if (a.kind === 'all' || b.kind === 'all') return a.kind === b.kind;
  return a.storeName === b.storeName;
}

/** 按鈕順序：目前登入門市、全部商品、其他門市（依名稱）。 */
export function storeFilterButtons(stores: readonly StoreDto[], loginStoreName: string): StoreFilterButton[] {
  const login = loginStoreName.trim();
  const buttons: StoreFilterButton[] = [];
  if (login) buttons.push({ key: `store:${login}`, label: login, filter: { kind: 'store', storeName: login } });
  buttons.push({ key: 'all', label: '全部商品', filter: ALL_PRODUCTS_FILTER });
  const others = [...new Set(stores.map((store) => store.name))]
    .filter((name) => name && name !== login)
    .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  for (const name of others) {
    buttons.push({ key: `store:${name}`, label: name, filter: { kind: 'store', storeName: name } });
  }
  return buttons;
}

/** 送給 GET /products 的門市範圍：登入門市不帶參數；其他門市帶 storeName；全部商品帶 allProducts。 */
export function storeFilterScope(filter: InventoryStoreFilter, loginStoreName: string): ProductStoreScope {
  if (filter.kind === 'all') return { allProducts: true };
  return filter.storeName === loginStoreName.trim() ? {} : { storeName: filter.storeName };
}

/**
 * 地點欄位、本門市可售／退貨、未販售標示、門市低庫存篩選以哪間門市為準：
 * 選門市時是那間；全部商品時是登入門市（沒有時 null）。
 */
export function focusStoreName(filter: InventoryStoreFilter, loginStoreName: string): string | null {
  if (filter.kind === 'store') return filter.storeName;
  return loginStoreName.trim() || null;
}

export function findStore(stores: readonly StoreDto[], name: string | null): StoreDto | null {
  if (!name) return null;
  return stores.find((store) => store.name === name) ?? null;
}

/** 所選門市的販售範圍；全部商品或還沒讀到門市時 null。 */
export function selectedStoreScope(
  filter: InventoryStoreFilter,
  stores: readonly StoreDto[]
): StoreProductScope | null {
  if (filter.kind === 'all') return null;
  const store = findStore(stores, filter.storeName);
  return store ? storeProductScope(store) : null;
}
