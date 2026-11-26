import { beforeEach, describe, expect, it } from 'vitest';
import type { CheckoutOrder } from '@/types/checkout';
import type { Product } from '@/types/product';
import { MockCheckoutService } from './mockCheckoutService';
import { getProducts, setCustomers, setOrders, setProducts, setStoredStores } from './storageHelper';
import { defaultLocationRows, LOCATIONS_STORAGE_KEY } from './inventoryCatalog';

const NORMAL = 'e1a10001-0000-4000-8000-000000000001';
const RETURNED = 'e1a10005-0000-4000-8000-000000000005';
const PREORDER = 'e1a10006-0000-4000-8000-000000000006';

function product(normalQty: number, returnedQty: number): Product {
  return {
    id: 'prod-1',
    sku: 'SKU-1',
    normalizedSku: 'SKU1',
    barcode: '1',
    brand: 'B',
    name: '模型',
    listPrice: 100,
    inventories: [
      { location: NORMAL, locationName: '門市現貨', quantity: normalQty },
      { location: RETURNED, locationName: '退貨品', quantity: returnedQty },
    ],
    totalInventory: normalQty + returnedQty,
    loginStoreQuantity: normalQty,
    loginStoreReturnedQuantity: returnedQty,
  };
}

function qty(locationId: string): number {
  const row = getProducts()[0]?.inventories.find((item) => item.location === locationId);
  return row?.quantity ?? 0;
}

describe('return restock locations', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(defaultLocationRows()));
    localStorage.setItem(
      'FREDS_POS_SESSION',
      JSON.stringify({ state: { storeName: '奇可門市' }, version: 4 })
    );
    setStoredStores([
      {
        name: '奇可門市',
        inventoryLocationId: NORMAL,
        inventoryLocationName: '門市現貨',
        returnedInventoryLocationId: RETURNED,
        returnedInventoryLocationName: '退貨品',
        preorderInventoryLocationId: PREORDER,
        preorderInventoryLocationName: '預購保留',
      },
    ]);
    setProducts([product(3, 1)]);
    setOrders([]);
  });

  it('adds a checked return to the normal location and an unchecked return to the returned location', async () => {
    const service = new MockCheckoutService();
    const checked = await service.createCheckoutOrder({
      items: [{ productId: 'prod-1', quantity: -1, restock: true }],
      shippingFee: 0,
      payments: [{ type: 'cash', name: '現金', amount: -100 }],
    });
    expect(checked.order.orderNumber.startsWith('SO-')).toBe(true);
    expect(checked.order.items[0]?.inventoryLocationName).toBe('門市現貨');
    expect(qty(NORMAL)).toBe(4);
    expect(qty(RETURNED)).toBe(1);

    const unchecked = await service.createCheckoutOrder({
      items: [{ productId: 'prod-1', quantity: -2, restock: false }],
      shippingFee: 0,
      payments: [{ type: 'cash', name: '現金', amount: -200 }],
    });
    expect(unchecked.order.items[0]?.inventoryLocationName).toBe('退貨品');
    expect(qty(NORMAL)).toBe(4);
    expect(qty(RETURNED)).toBe(3);
  });

  it('deducts a preorder pickup line from the preorder location, alongside points discount', async () => {
    setCustomers([
      {
        id: 'cust-1',
        name: '會員',
        phone: '0900000000',
        email: null,
        vipTier: 'Retail',
        vipTierName: '零售客戶 (Retail)',
        totalSpent: 0,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ] as never);
    const service = new MockCheckoutService();
    const result = await service.createCheckoutOrder({
      customerId: 'cust-1',
      items: [
        { productId: 'prod-1', quantity: 1, unitPrice: 0, pointsDiscountApplied: true, preorderPickup: true },
        { productId: 'prod-1', quantity: 2, unitPrice: 100, preorderPickup: true },
        { productId: 'prod-1', quantity: 1, unitPrice: 100 },
      ],
      shippingFee: 0,
      payments: [{ type: 'cash', name: '現金', amount: 300 }],
    });
    expect(result.order.items.map((item) => item.preorderPickup)).toEqual([true, true, false]);
    expect(result.order.items[0]?.inventoryLocationName).toBe('預購保留');
    expect(result.order.items[2]?.inventoryLocationName).toBe('門市現貨');
    expect(qty(PREORDER)).toBe(-3);
    expect(qty(NORMAL)).toBe(2);
  });

  it('rejects preorder pickup on a return line', async () => {
    const service = new MockCheckoutService();
    await expect(
      service.createCheckoutOrder({
        items: [{ productId: 'prod-1', quantity: -1, restock: true, preorderPickup: true }],
        shippingFee: 0,
        payments: [{ type: 'cash', name: '現金', amount: -100 }],
      })
    ).rejects.toThrow('退貨品項不能標記預購取貨');
  });
});

function historyOrder(id: string, totalAmount: number, itemName: string): CheckoutOrder {
  return {
    id,
    orderNumber: `SO-${id}`,
    cashierId: 'staff-001',
    cashierName: '店長 Fred',
    status: 'completed',
    items: [
      {
        productId: 'prod-1',
        sku: 'SKU-1',
        name: itemName,
        originalPrice: 100,
        unitPrice: 100,
        isManualPrice: false,
        quantity: 1,
        subtotal: totalAmount,
      },
    ],
    itemsSubtotal: totalAmount,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount,
    payments: [],
    createdAt: '2026-11-16T02:00:00.000Z',
    updatedAt: '2026-11-16T02:00:00.000Z',
  };
}

describe('mock order history filters', () => {
  beforeEach(() => {
    localStorage.clear();
    setProducts([product(1, 0)]);
    setOrders([
      historyOrder('zero', 0, '鋼彈'),
      historyOrder('refund', -50, '其他'),
      historyOrder('sale', 120, '鋼彈'),
    ]);
  });

  it('returns an array and applies productKeyword plus zero amount bounds', async () => {
    const service = new MockCheckoutService();

    const atLeastZero = await service.getOrderHistory({ minAmount: 0 });
    expect(atLeastZero.map((row) => row.id).sort()).toEqual(['sale', 'zero']);

    const atMostZero = await service.getOrderHistory({ maxAmount: 0 });
    expect(atMostZero.map((row) => row.id).sort()).toEqual(['refund', 'zero']);

    const exactZero = await service.getOrderHistory({ minAmount: 0, maxAmount: 0, productKeyword: '鋼彈' });
    expect(exactZero.map((row) => row.id)).toEqual(['zero']);

    const listed = await service.getOrderHistory({ productKeyword: '鋼彈' });
    expect(Array.isArray(listed)).toBe(true);
    expect(() => listed.sort((a, b) => a.totalAmount - b.totalAmount)).not.toThrow();
  });

  it('refuses an unfiltered history but still pages every order through searchOrderPage', async () => {
    const service = new MockCheckoutService();
    await expect(service.getOrderHistory()).rejects.toThrow('至少需要一個篩選條件');
    await expect(service.getOrderHistory({ status: 'all' })).rejects.toThrow('至少需要一個篩選條件');

    const first = await service.searchOrderPage({ page: 1, pageSize: 2 });
    const second = await service.searchOrderPage({ page: 2, pageSize: 2 });
    expect(first.total).toBe(3);
    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(1);
  });
});

describe('points discount (點數折抵)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(defaultLocationRows()));
    localStorage.setItem('FREDS_POS_SESSION', JSON.stringify({ state: { storeName: '奇可門市' }, version: 4 }));
    setStoredStores([
      {
        name: '奇可門市',
        inventoryLocationId: NORMAL,
        inventoryLocationName: '門市現貨',
        returnedInventoryLocationId: RETURNED,
        returnedInventoryLocationName: '退貨品',
        preorderInventoryLocationId: PREORDER,
        preorderInventoryLocationName: '預購保留',
      },
    ]);
    setProducts([{ ...product(3, 0), listPrice: 500 }]);
    setOrders([]);
    setCustomers([
      {
        id: 'cust-1', name: '王小明', phone: '0900000000', email: null, vipTier: 'Retail',
        vipTierName: '零售客戶 (Retail)', totalSpent: 0, createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
      },
    ]);
  });

  const cash = (amount: number) => [{ type: 'cash' as const, name: '現金', amount }];

  it('keeps the sent unit price, stores only the flag, and splits 折讓 from 點數折抵', async () => {
    const { order } = await new MockCheckoutService().createCheckoutOrder({
      customerId: 'cust-1',
      items: [
        { productId: 'prod-1', quantity: 2, unitPrice: 500, isManualPrice: false },
        { productId: 'prod-1', quantity: 1, unitPrice: 140, isManualPrice: false, pointsDiscountApplied: true },
      ],
      shippingFee: 0,
      payments: cash(1140),
    });
    expect(order.items[1]).toMatchObject({ unitPrice: 140, subtotal: 140, pointsDiscountApplied: true });
    expect(order.items[0]).toMatchObject({ pointsDiscountApplied: false });
    expect(order.items[1]).not.toHaveProperty('pointsDiscountAmount');
    expect(order.pointsDiscountAmount).toBe(360);
    expect(order.discountAmount).toBe(0);
    expect(order.totalAmount).toBe(1140);
  });

  it('counts the whole gap of a manually priced points line as 點數折抵, not 折讓', async () => {
    const { order } = await new MockCheckoutService().createCheckoutOrder({
      customerId: 'cust-1',
      items: [
        { productId: 'prod-1', quantity: 1, unitPrice: 450, isManualPrice: true, priceDiffReason: '熟客' },
        { productId: 'prod-1', quantity: 1, unitPrice: 90, isManualPrice: true, pointsDiscountApplied: true },
      ],
      shippingFee: 0,
      payments: cash(540),
    });
    expect(order.discountAmount).toBe(50);
    expect(order.pointsDiscountAmount).toBe(410);
    expect(order.itemsSubtotal).toBe(1000 - 50 - 410);
  });

  it('rejects a points line with quantity other than 1 or a negative price', async () => {
    const service = new MockCheckoutService();
    await expect(
      service.createCheckoutOrder({
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 140, pointsDiscountApplied: true }],
        shippingFee: 0,
        payments: cash(280),
      })
    ).rejects.toThrow('點數折抵的品項數量必須為 1');
    await expect(
      service.createCheckoutOrder({
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: -1, pointsDiscountApplied: true }],
        shippingFee: 0,
        payments: cash(0),
      })
    ).rejects.toThrow('點數折抵後單價不能為負數');
  });

  it('lets a return of a points line inherit the flag so the refund reverses 點數折抵', async () => {
    const service = new MockCheckoutService();
    const { order: sale } = await service.createCheckoutOrder({
      customerId: 'cust-1',
      items: [{ productId: 'prod-1', quantity: 1, unitPrice: 140, pointsDiscountApplied: true }],
      shippingFee: 0,
      payments: cash(140),
    });
    const { order: refund } = await service.createCheckoutOrder({
      customerId: 'cust-1',
      items: [{ productId: 'prod-1', quantity: -1, originalOrderId: sale.id }],
      shippingFee: 0,
      payments: cash(-140),
    });
    expect(refund.items[0]).toMatchObject({ unitPrice: 140, pointsDiscountApplied: true, subtotal: -140 });
    expect(refund.pointsDiscountAmount).toBe(-360);
    expect(refund.discountAmount).toBe(0);
    expect(refund.totalAmount).toBe(-140);
  });

  it('rejects walk-in customers and a second redemption of the same product', async () => {
    const service = new MockCheckoutService();
    await expect(
      service.createCheckoutOrder({
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 140, pointsDiscountApplied: true }],
        shippingFee: 0,
        payments: cash(140),
      })
    ).rejects.toThrow('散客不能使用點數折抵');
    await expect(
      service.createCheckoutOrder({
        customerId: 'cust-1',
        items: [
          { productId: 'prod-1', quantity: 1, unitPrice: 140, pointsDiscountApplied: true },
          { productId: 'prod-1', quantity: 1, unitPrice: 140, pointsDiscountApplied: true },
        ],
        shippingFee: 0,
        payments: cash(280),
      })
    ).rejects.toThrow('同一商品只能折抵一次');
  });
});

describe('mock order history storeName', () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredStores([
      {
        name: '奇可門市',
        inventoryLocationId: NORMAL,
        inventoryLocationName: '門市現貨',
        returnedInventoryLocationId: RETURNED,
        returnedInventoryLocationName: '退貨品',
        preorderInventoryLocationId: PREORDER,
        preorderInventoryLocationName: '預購保留',
      },
      {
        name: '台南快閃店',
        inventoryLocationId: NORMAL,
        inventoryLocationName: '門市現貨',
        returnedInventoryLocationId: RETURNED,
        returnedInventoryLocationName: '退貨品',
        preorderInventoryLocationId: PREORDER,
        preorderInventoryLocationName: '預購保留',
      },
    ]);
    setProducts([product(1, 0)]);
    setOrders([
      { ...historyOrder('main', 100, '鋼彈'), branchId: '奇可門市', branchName: '奇可門市' },
      { ...historyOrder('popup', 200, '鋼彈'), branchId: '台南快閃店', branchName: '台南快閃店' },
      { ...historyOrder('legacy', 300, '鋼彈'), branchId: 'branch-store', branchName: '台北旗艦店' },
    ]);
  });

  it('keeps only orders of that store, lists every order without it, and rejects an unknown store', async () => {
    const service = new MockCheckoutService();
    const ids = (rows: CheckoutOrder[]) => rows.map((row) => row.id).sort();

    expect(ids(await service.getOrderHistory({ productKeyword: '鋼彈', storeName: '奇可門市' }))).toEqual(['main']);
    expect(ids(await service.getOrderHistory({ productKeyword: '鋼彈' }))).toEqual(['legacy', 'main', 'popup']);
    expect(ids(await service.getRecentOrders(10, { storeName: ' 台南快閃店 ' }))).toEqual(['popup']);
    expect(ids(await service.getRecentOrders(10))).toEqual(['legacy', 'main', 'popup']);
    expect((await service.searchOrderPage({ storeName: '奇可門市', page: 1, pageSize: 10 })).total).toBe(1);
    // storeName 不算限縮條件。
    await expect(service.getOrderHistory({ storeName: '奇可門市' })).rejects.toThrow('至少需要一個篩選條件');
    await expect(service.getRecentOrders(10, { storeName: '不存在' })).rejects.toMatchObject({ code: 'STORE_NOT_FOUND' });
    await expect(service.getOrderHistory({ productKeyword: '鋼彈', storeName: '不存在' })).rejects.toMatchObject({
      code: 'STORE_NOT_FOUND',
    });
  });
});
