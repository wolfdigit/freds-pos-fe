import type { LocationStock } from '@/types/product';

/** Existing shared shelf. Backend uses this id only when a new store omits a location and this row still exists. */
export const LEGACY_SHARED_STOCK_LOCATION_ID = 'e1a10001-0000-4000-8000-000000000001';

/** Mock product rows still store the shared shelf as `store`. Live rows use the location id. */
const MOCK_SHARED_SHELF_KEY = 'store';

export interface StoreShelfRecord {
  stockLocationId?: string | null;
  stockLocationName?: string | null;
}

/** The row checkout will use. The `store` key is read only for the known shared location id. */
export function matchingStockRow(
  stocks: LocationStock[] | undefined,
  stockLocationId: string | null | undefined
): LocationStock | undefined {
  const rows = stocks ?? [];
  const id = stockLocationId?.trim() || LEGACY_SHARED_STOCK_LOCATION_ID;
  const direct = rows.find((row) => row.location === id);
  if (direct) return direct;
  if (id === LEGACY_SHARED_STOCK_LOCATION_ID) {
    return rows.find((row) => row.location === MOCK_SHARED_SHELF_KEY);
  }
  return undefined;
}

export function quantityAtMappedLocation(
  stocks: LocationStock[] | undefined,
  stockLocationId: string | null | undefined
): number {
  return matchingStockRow(stocks, stockLocationId)?.quantity ?? 0;
}

export function currentShelfName(record: StoreShelfRecord | undefined): string {
  const named = record?.stockLocationName?.trim();
  if (named) return named;
  const id = record?.stockLocationId?.trim();
  if (id && id !== LEGACY_SHARED_STOCK_LOCATION_ID) return '對應庫存地點';
  return '門市現貨';
}

export function restockShelfLabel(storeName: string, record: StoreShelfRecord | undefined): string {
  const store = storeName.trim() || '目前登入門市';
  return `「${store}」對應的${currentShelfName(record)}`;
}

/** Pick transfer endpoints from real location ids. Destination prefers the login store's mapped row. */
export function defaultTransferLocations(input: {
  optionIds: string[];
  stocks: LocationStock[] | undefined;
  mappedLocationId?: string | null;
}): { fromLocation: string; toLocation: string } {
  const options = input.optionIds.filter((id) => id.trim());
  const mappedRow = matchingStockRow(input.stocks, input.mappedLocationId);
  const toLocation =
    mappedRow?.location ||
    options.find((id) => id === (input.mappedLocationId?.trim() || LEGACY_SHARED_STOCK_LOCATION_ID)) ||
    options[0] ||
    input.stocks?.[0]?.location ||
    LEGACY_SHARED_STOCK_LOCATION_ID;
  const fromLocation =
    options.find((id) => id !== toLocation && matchingStockRow(input.stocks, id)) ||
    input.stocks?.find((row) => row.location !== toLocation)?.location ||
    options.find((id) => id !== toLocation) ||
    toLocation;
  return { fromLocation, toLocation };
}
