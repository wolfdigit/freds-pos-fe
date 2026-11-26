import type { InventoryLocationDto } from '@/types/inventory';

type OrderedLocation = Pick<
  InventoryLocationDto,
  'id' | 'displayOrder' | 'storeNames' | 'returnedStoreNames' | 'preorderStoreNames' | 'systemRole'
>;

const SYSTEM_ROLE_RANK: Record<string, number> = { company: 3, preorder: 4, defective: 5 };
const OTHER_STORE_RANK = 6;
const UNBOUND_RANK = 7;

function has(names: readonly string[] | undefined, name: string): boolean {
  return Boolean(names?.includes(name));
}

/**
 * 地點在庫存頁的排序群組（越小越前面）：
 * 0–2 所選門市的可售、預購保留、退貨；3–5 系統地點公司總倉、預購保留、退貨品；
 * 6 其他門市綁定的地點；7 沒有門市綁定的地點。同一地點符合多個群組時取最前面的。
 */
export function locationRank(location: OrderedLocation, storeName: string | null): number {
  const ranks: number[] = [];
  if (storeName) {
    if (has(location.storeNames, storeName)) ranks.push(0);
    if (has(location.preorderStoreNames, storeName)) ranks.push(1);
    if (has(location.returnedStoreNames, storeName)) ranks.push(2);
  }
  const systemRank = location.systemRole ? SYSTEM_ROLE_RANK[location.systemRole] : undefined;
  if (systemRank !== undefined) ranks.push(systemRank);
  const bound =
    (location.storeNames?.length ?? 0) +
      (location.returnedStoreNames?.length ?? 0) +
      (location.preorderStoreNames?.length ?? 0) >
    0;
  ranks.push(bound ? OTHER_STORE_RANK : UNBOUND_RANK);
  return Math.min(...ranks);
}

/** 依所選門市排地點欄位；同群組依 displayOrder、再依 id。不改動傳入的陣列。 */
export function orderLocationsForStore<T extends OrderedLocation>(locations: readonly T[], storeName: string | null): T[] {
  return locations
    .map((location, index) => ({ location, index, rank: locationRank(location, storeName) }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (a.location.displayOrder ?? 999) - (b.location.displayOrder ?? 999) ||
        a.location.id.localeCompare(b.location.id) ||
        a.index - b.index
    )
    .map((row) => row.location);
}
