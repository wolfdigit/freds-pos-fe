import { locationService, productService } from '@/services';
import type { InventoryLocationDto } from '@/types/inventory';

export interface LocationDeleteSnapshot {
  location: InventoryLocationDto | null;
  targets: InventoryLocationDto[];
  hasQuantity: boolean;
}

/** Current server bindings and non-zero quantities for one location. */
export async function loadLocationDeleteSnapshot(locationId: string): Promise<LocationDeleteSnapshot> {
  const [locations, products] = await Promise.all([
    locationService.getLocations(),
    productService.searchProducts({}),
  ]);
  const location = locations.find((item) => item.id === locationId) ?? null;
  const hasQuantity = products.some((product) =>
    product.inventories?.some((row) => row.location === locationId && row.quantity !== 0)
  );
  return {
    location,
    targets: locations.filter((item) => item.id !== locationId),
    hasQuantity,
  };
}
