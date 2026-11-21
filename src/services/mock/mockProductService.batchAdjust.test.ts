import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import { MockProductService } from './mockProductService';
import { getProducts, getStockLogs, setProducts } from './storageHelper';
import { defaultLocationRows, LOCATIONS_STORAGE_KEY } from './inventoryCatalog';

const NORMAL = 'e1a10001-0000-4000-8000-000000000001';
const RETURNED = 'e1a10005-0000-4000-8000-000000000005';

function product(): Product {
  return {
    id: 'prod-1', sku: 'SKU-1', normalizedSku: 'SKU1', barcode: '1', brand: 'B', name: '模型', listPrice: 100,
    inventories: [
      { location: NORMAL, locationName: '門市現貨', quantity: 5 },
      { location: RETURNED, locationName: '退貨品', quantity: 0 },
    ],
    totalInventory: 5, loginStoreQuantity: 5, loginStoreReturnedQuantity: 0,
  };
}

const transfer = {
  productId: 'prod-1', sku: 'SKU-1', name: '模型', brand: 'B', summaryText: '調撥 2 台',
  changes: [
    { location: NORMAL, locationName: '門市現貨', oldQty: 5, newQty: 3, diff: -2 },
    { location: RETURNED, locationName: '退貨品', oldQty: 0, newQty: 2, diff: 2 },
  ],
};

describe('mock batchAdjustStock 異動原因選填', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(defaultLocationRows()));
    setProducts([product()]);
  });

  it('accepts a transfer without a reason', async () => {
    await expect(new MockProductService().batchAdjustStock({ adjustments: [transfer] })).resolves.toBe(true);
    const rows = getProducts()[0].inventories;
    expect(rows.find((r) => r.location === NORMAL)?.quantity).toBe(3);
    expect(rows.find((r) => r.location === RETURNED)?.quantity).toBe(2);
    expect(getStockLogs()[0].note).toBeUndefined();
  });

  it('treats a blank reason as none and trims a filled one', async () => {
    const service = new MockProductService();
    await service.batchAdjustStock({ adjustments: [transfer], note: '   ' });
    expect(getStockLogs().some((log) => log.note === undefined)).toBe(true);
    await service.batchAdjustStock({ adjustments: [transfer], note: '  補貨  ' });
    expect(getStockLogs().some((log) => log.note === '補貨')).toBe(true);
  });
});
