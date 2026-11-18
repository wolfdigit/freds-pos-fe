import { locationService } from '@/services';
import type { InventoryLocationDto } from '@/types/inventory';

export interface LocationDeleteSnapshot {
  location: InventoryLocationDto | null;
  targets: InventoryLocationDto[];
  hasQuantity: boolean;
}

/** Current server bindings and non-zero quantities for one location. */
export async function loadLocationDeleteSnapshot(locationId: string): Promise<LocationDeleteSnapshot> {
  const [locations, summary] = await Promise.all([
    // 刪除前一定讀最新綁定，不用共用結果。
    locationService.getLocations({ fresh: true }),
    // 後端算好的合計；hasNonZeroStock 含已下架商品，跟刪除時 LOCATION_NOT_EMPTY 的規則一致。
    locationService.getStockSummary(),
  ]);
  const location = locations.find((item) => item.id === locationId) ?? null;
  const hasQuantity = summary.some((row) => row.locationId === locationId && row.hasNonZeroStock);
  return {
    location,
    targets: locations.filter((item) => item.id !== locationId),
    hasQuantity,
  };
}
