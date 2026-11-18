import type { InventoryLocationDto, LocationStockSummary } from '@/types/inventory';
import { isDelistedProduct, type Product } from '@/types/product';

/**
 * 用商品清單算出各庫存點合計，規則跟 GET /inventory/locations/summary 一樣。
 * 只給 Mock 和「後端還沒有 summary API」時的備援使用。
 */
export function summarizeLocationStock(
  locations: Pick<InventoryLocationDto, 'id' | 'name'>[],
  products: Pick<Product, 'inventories' | 'status' | 'deleted'>[]
): LocationStockSummary[] {
  const rows = new Map<string, LocationStockSummary>();
  for (const location of locations) {
    rows.set(location.id, {
      locationId: location.id,
      locationName: location.name,
      totalQuantity: 0,
      productCount: 0,
      hasNonZeroStock: false,
    });
  }
  for (const product of products) {
    const active = !isDelistedProduct(product);
    for (const stock of product.inventories ?? []) {
      const row = rows.get(stock.location);
      if (!row || stock.quantity === 0) continue;
      row.hasNonZeroStock = true;
      if (!active) continue;
      row.totalQuantity += stock.quantity;
      row.productCount += 1;
    }
  }
  return [...rows.values()];
}
