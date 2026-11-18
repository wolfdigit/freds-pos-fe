import { describe, expect, it } from 'vitest';
import { matchesStockFilters, type Product } from './product';

function product(over: Partial<Product>): Product {
  return {
    id: 'p',
    inventories: [{ location: 'wh', locationName: '倉', quantity: 1 }],
    totalInventory: 1,
    loginStoreQuantity: 0,
    loginStoreReturnedQuantity: 0,
    ...over,
  } as Product;
}

describe('matchesStockFilters', () => {
  it('uses the same inclusive bounds as the backend', () => {
    expect(matchesStockFilters(product({ loginStoreQuantity: 2 }), { loginStoreQuantityMax: 2 })).toBe(true);
    expect(matchesStockFilters(product({ loginStoreQuantity: 3 }), { loginStoreQuantityMax: 2 })).toBe(false);
    expect(matchesStockFilters(product({ loginStoreQuantity: -1 }), { loginStoreQuantityMax: 2 })).toBe(true);
    // 沒有選定門市（null）一律不符合。
    expect(matchesStockFilters(product({ loginStoreQuantity: null }), { loginStoreQuantityMax: 2 })).toBe(false);
    expect(
      matchesStockFilters(product({ loginStoreQuantity: 0 }), { loginStoreQuantityMin: 0, loginStoreQuantityMax: 0 })
    ).toBe(true);
    // 沒有庫存列的地點算 0。
    expect(matchesStockFilters(product({}), { locationId: 'other', locationQuantityMax: 0 })).toBe(true);
    expect(matchesStockFilters(product({}), { locationId: 'wh', locationQuantityMax: 0 })).toBe(false);
    expect(matchesStockFilters(product({ totalInventory: 0 }), { totalInventoryMin: 0, totalInventoryMax: 0 })).toBe(true);
    expect(matchesStockFilters(product({ totalInventory: 0 }), { inInventoryOnly: true })).toBe(false);
    expect(matchesStockFilters(product({}), {})).toBe(true);
  });
});
