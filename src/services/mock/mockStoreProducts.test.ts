import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import { useSessionStore } from '@/store/sessionStore';
import { MockCheckoutService } from './mockCheckoutService';
import { MockProductService } from './mockProductService';
import { MockSystemService } from './mockSystemService';
import { setOrders, setProducts, setStoredStores } from './storageHelper';
import { defaultLocationRows, LOCATIONS_STORAGE_KEY } from './inventoryCatalog';

const NORMAL = 'e1a10001-0000-4000-8000-000000000001';
const RETURNED = 'e1a10005-0000-4000-8000-000000000005';
const POPUP = '台南快閃店';
const MAIN = '奇可門市';

function product(sku: string): Product {
  return {
    id: `prod-${sku}`,
    sku,
    normalizedSku: sku,
    barcode: `BAR-${sku}`,
    brand: `牌${sku}`,
    name: `QA-${sku}`,
    listPrice: 100,
    inventories: [{ location: NORMAL, locationName: '門市現貨', quantity: 5 }],
    totalInventory: 5,
    loginStoreQuantity: 5,
    loginStoreReturnedQuantity: 0,
  };
}

function login(storeName: string, role: 'admin' | 'staff' = 'staff') {
  useSessionStore.setState({ storeName, userRole: role, cashierName: '店員乙' });
  localStorage.setItem('FREDS_POS_SESSION', JSON.stringify({ state: { storeName }, version: 4 }));
}

const skus = (rows: { sku: string }[]) => rows.map((row) => row.sku);

describe('mock store product list', () => {
  const system = new MockSystemService();
  const products = new MockProductService();

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(defaultLocationRows()));
    const store = {
      inventoryLocationId: NORMAL,
      inventoryLocationName: '門市現貨',
      returnedInventoryLocationId: RETURNED,
      returnedInventoryLocationName: '退貨品',
      preorderInventoryLocationId: NORMAL,
      preorderInventoryLocationName: '門市現貨',
    };
    setStoredStores([
      { name: MAIN, ...store },
      { name: POPUP, ...store },
    ]);
    setProducts(['A', 'B', 'C', 'D', 'E'].map(product));
    setOrders([]);
    // 一般店員也可以切換販售範圍。
    login(MAIN);
    await system.setStoreProductScope(POPUP, 'list');
    await system.saveStoreProducts(POPUP, { add: ['prod-A', 'prod-B', 'prod-D'], remove: [] });
  });

  it('lists only listed products in a list store and marks soldInLoginStore', async () => {
    login(MAIN);
    expect(skus(await products.searchProducts({}))).toEqual(['A', 'B', 'C', 'D', 'E']);
    login(POPUP);
    expect(skus(await products.searchProducts({}))).toEqual(['A', 'B', 'D']);
    expect(skus(await products.getProductsByBarcode('BAR-C'))).toEqual([]);
    expect((await products.getProductById('prod-C'))?.soldInLoginStore).toBe(false);
    expect(await products.checkProductAvailability('prod-C')).toBe('notInStore');
    expect(await products.checkProductAvailability('prod-A')).toBe('available');
    // 一般店員也可以看全部商品。
    expect(skus(await products.searchProducts({ allProducts: true }))).toHaveLength(5);
    login(POPUP, 'admin');
    expect(skus(await products.searchProducts({ allProducts: true }))).toHaveLength(5);
  });

  it('adds a product created in a list store to that store only', async () => {
    login(POPUP);
    const created = await products.createProduct({ sku: 'NEW', barcode: 'NEW', brand: 'B', name: 'QA-NEW', listPrice: 1 });
    expect(created.soldInLoginStore).toBe(true);
    const page = await system.listStoreProducts(POPUP, { keyword: 'NEW', page: 1, pageSize: 50 });
    expect(page.items[0]).toMatchObject({ sku: 'NEW', inList: true, addedBy: '店員乙' });
    expect(page.listedTotal).toBe(4);
  });

  it('editor searches, filters and copies lists', async () => {
    login(MAIN);
    const listed = await system.listStoreProducts(POPUP, { inList: true, page: 1, pageSize: 2 });
    expect(skus(listed.items)).toEqual(['A', 'B']);
    expect(listed.total).toBe(3);
    expect(listed.listedTotal).toBe(3);
    const found = await system.listStoreProducts(POPUP, { keyword: '牌C', page: 1, pageSize: 50 });
    expect(found.items.map((row) => [row.sku, row.inList])).toEqual([['C', false]]);
    // 整批不寫入：有一個商品找不到就全部不變。
    await expect(
      system.saveStoreProducts(POPUP, { add: ['prod-missing'], remove: ['prod-A'] })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
    await expect(system.saveStoreProducts(POPUP, { add: [], remove: [] })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(
      system.saveStoreProducts(POPUP, { add: ['prod-A'], remove: ['prod-A'] })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect((await system.listStoreProducts(POPUP, { page: 1, pageSize: 50 })).listedTotal).toBe(3);
    // 一次存檔：E 加入、A 已在（不算）、B 移出、C 本來不在（不算）。
    const saved = await system.saveStoreProducts(POPUP, { add: ['prod-E', 'prod-A'], remove: ['prod-B', 'prod-C'] });
    expect(saved).toMatchObject({ added: 1, removed: 1, changed: 2, listedTotal: 3 });
    await system.saveStoreProducts(POPUP, { add: ['prod-B'], remove: ['prod-E'] });
    expect((await system.setStoreProductScope(POPUP, 'all')).productScope).toBe('all');
    await system.setStoreProductScope(POPUP, 'list');

    await system.saveStoreProducts(MAIN, { add: ['prod-E'], remove: [] });
    const merged = await system.copyStoreProducts(MAIN, { sourceStoreName: POPUP });
    expect(merged).toMatchObject({ changed: 3, added: 3, removed: 0, listedTotal: 4 });
    const replaced = await system.copyStoreProducts(MAIN, { sourceStoreName: POPUP, replace: true });
    expect(replaced).toMatchObject({ changed: 1, added: 0, removed: 1, listedTotal: 3 });
  });

  it('checkout rejects unlisted sales in a list store but allows returns', async () => {
    login(POPUP);
    const checkout = new MockCheckoutService();
    await expect(
      checkout.createCheckoutOrder({
        items: [{ productId: 'prod-C', quantity: 1 }],
        shippingFee: 0,
        payments: [{ type: 'cash', name: '現金', amount: 100 }],
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_IN_STORE' });
    const sale = await checkout.createCheckoutOrder({
      items: [{ productId: 'prod-A', quantity: 1 }],
      shippingFee: 0,
      payments: [{ type: 'cash', name: '現金', amount: 100 }],
    });
    await system.saveStoreProducts(POPUP, { add: [], remove: ['prod-A'] });
    const refund = await checkout.createCheckoutOrder({
      items: [
        {
          productId: 'prod-A',
          quantity: -1,
          originalOrderId: sale.order.id,
        },
      ],
      shippingFee: 0,
      payments: [{ type: 'cash', name: '現金', amount: -100 }],
    });
    expect(refund.order.items[0].quantity).toBe(-1);
  });
});
