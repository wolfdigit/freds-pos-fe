import type { LocationStock } from '@/types/product';

/** Existing shared shelf. Backend uses this id only when a new store omits a location and this row still exists. */
export const LEGACY_SHARED_STOCK_LOCATION_ID = 'e1a10001-0000-4000-8000-000000000001';

/** Mock product rows still store the shared shelf as `store`. Live rows use the location id. */
const MOCK_SHARED_SHELF_KEY = 'store';

export function quantityAtMappedLocation(
  stocks: LocationStock[] | undefined,
  stockLocationId: string | null | undefined
): number {
  const rows = stocks ?? [];
  if (!stockLocationId) {
    return rows.find((row) => row.location === MOCK_SHARED_SHELF_KEY)?.quantity ?? 0;
  }
  const direct = rows.find((row) => row.location === stockLocationId);
  if (direct) return direct.quantity;
  if (stockLocationId === LEGACY_SHARED_STOCK_LOCATION_ID) {
    return rows.find((row) => row.location === MOCK_SHARED_SHELF_KEY)?.quantity ?? 0;
  }
  return 0;
}
