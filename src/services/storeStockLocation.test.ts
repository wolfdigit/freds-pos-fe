import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEGACY_SHARED_STOCK_LOCATION_ID } from '@/auth/stockLocation';
import { buildCheckoutPayload } from '@/features/checkout/buildCheckoutPayload';
import { MockCheckoutService } from '@/services/mock/mockCheckoutService';
import { MockLocationService } from '@/services/mock/mockLocationService';
import { MockSystemService } from '@/services/mock/mockSystemService';
import { CURRENT_SCHEMA_VERSION, setProducts, setStoredStores, STORAGE_KEYS } from '@/services/mock/storageHelper';
import { useSessionStore } from '@/store/sessionStore';
import type { CartItem } from '@/store/cartStore';
import type { Product } from '@/types/product';
import { BusinessError } from '@/utils/errors';
import { HttpSystemService } from '@/services/api/httpSystemService';

const WAREHOUSE_ID = 'e1a10002-0000-4000-8000-000000000002';

function product(quantity: number, location = 'store'): Product {
  return {
    id: 'prod-1',
    sku: 'SKU-1',
    normalizedSku: 'SKU1',
    barcode: '111',
    name: '測試車',
    brand: 'MiniGT',
    scale: '1/64',
    listPrice: 100,
    totalStock: quantity,
    stocks: [{ location, locationName: '門市現貨', quantity }],
  };
}

function saleItem(): CartItem {
  return {
    productId: 'prod-1',
    sku: 'SKU-1',
    name: '測試車',
    brand: 'MiniGT',
    originalPrice: 100,
    unitPrice: 100,
    isManualPrice: false,
    quantity: 1,
  };
}

describe('store stock location mapping', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    setStoredStores([
      { name: '奇可門市', isDefault: true },
      { name: '線上網購', isDefault: false },
    ]);
    setProducts([product(3)]);
    useSessionStore.setState({
      userRole: 'admin',
      storeName: '奇可門市',
      stores: ['奇可門市', '線上網購'],
      storeRecords: [
        { name: '奇可門市', isDefault: true, stockLocationId: LEGACY_SHARED_STOCK_LOCATION_ID, stockLocationName: '門市現貨' },
        { name: '線上網購', isDefault: false, stockLocationId: WAREHOUSE_ID, stockLocationName: '後方倉庫' },
      ],
    });
  });

  it('reads the shared shelf for existing stores and saves a chosen location', async () => {
    const system = new MockSystemService();
    const listed = await system.getStores();
    expect(listed.find((store) => store.name === '奇可門市')).toMatchObject({
      stockLocationId: LEGACY_SHARED_STOCK_LOCATION_ID,
      stockLocationName: '門市現貨',
    });

    const updated = await system.updateStoreStockLocation('奇可門市', { stockLocationId: WAREHOUSE_ID });
    expect(updated).toMatchObject({ name: '奇可門市', stockLocationId: WAREHOUSE_ID, stockLocationName: '後方倉庫' });
    await expect(system.updateStoreStockLocation('奇可門市', { stockLocationId: 'missing-location' })).rejects.toMatchObject({
      code: 'LOCATION_NOT_FOUND',
    });
  });

  it('creates a store on the shared shelf only while that shelf exists', async () => {
    const system = new MockSystemService();
    const created = await system.createStore({ name: '高雄店' });
    expect(created.stockLocationId).toBe(LEGACY_SHARED_STOCK_LOCATION_ID);

    await expect(system.createStore({ name: '不存在店', stockLocationId: 'missing-location' })).rejects.toMatchObject({
      code: 'LOCATION_NOT_FOUND',
    });

    localStorage.setItem(
      'FREDS_POS_LOCATIONS',
      JSON.stringify([{ id: WAREHOUSE_ID, name: '後方倉庫', displayOrder: 1, isActive: true }])
    );
    await expect(system.createStore({ name: '必須指定店' })).rejects.toMatchObject({
      code: 'STOCK_LOCATION_REQUIRED',
    });
    const explicit = await system.createStore({ name: '必須指定店', stockLocationId: WAREHOUSE_ID });
    expect(explicit.stockLocationName).toBe('後方倉庫');
  });

  it('blocks deleting a location that a store still uses and keeps the location', async () => {
    const locations = new MockLocationService();
    await expect(
      locations.deleteLocation(LEGACY_SHARED_STOCK_LOCATION_ID, { transferToLocation: WAREHOUSE_ID })
    ).rejects.toBeInstanceOf(BusinessError);
    await expect(
      locations.deleteLocation(LEGACY_SHARED_STOCK_LOCATION_ID, { transferToLocation: WAREHOUSE_ID })
    ).rejects.toMatchObject({ code: 'STOCK_LOCATION_IN_USE' });
    const remaining = await locations.getLocations();
    expect(remaining.some((location) => location.id === LEGACY_SHARED_STOCK_LOCATION_ID)).toBe(true);
  });

  it('deducts and restocks the login store mapping without a checkout location field', async () => {
    const payload = buildCheckoutPayload({
      items: [{ ...saleItem(), quantity: -1, restock: false, originalOrderId: 'so-1' }],
      shippingFee: 0,
      payments: [],
    });
    expect(payload).not.toHaveProperty('stockLocationId');
    expect(payload.items[0]?.restock).toBe(false);
    expect(buildCheckoutPayload({ items: [saleItem()], shippingFee: 0, payments: [] }).items[0]?.restock).toBe(true);

    const checkout = new MockCheckoutService();
    useSessionStore.setState({ storeName: '線上網購' });
    setProducts([
      {
        ...product(7),
        stocks: [
          { location: 'store', locationName: '門市現貨', quantity: 5 },
          { location: WAREHOUSE_ID, locationName: '後方倉庫', quantity: 2 },
        ],
      },
    ]);
    await checkout.createCheckoutOrder(
      buildCheckoutPayload({
        items: [saleItem()],
        shippingFee: 0,
        payments: [{ type: 'cash', name: '現金', amount: 100 }],
      })
    );
    const afterSale = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]') as Product[];
    expect(afterSale[0]?.stocks.find((row) => row.location === WAREHOUSE_ID)?.quantity).toBe(1);
    expect(afterSale[0]?.stocks.find((row) => row.location === 'store')?.quantity).toBe(5);

    await expect(
      checkout.createCheckoutOrder(
        buildCheckoutPayload({
          items: [{ ...saleItem(), quantity: 5 }],
          shippingFee: 0,
          payments: [{ type: 'cash', name: '現金', amount: 500 }],
        })
      )
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_STORE_STOCK' });
    const unchanged = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]') as Product[];
    expect(unchanged[0]?.stocks.find((row) => row.location === WAREHOUSE_ID)?.quantity).toBe(1);

    await checkout.createCheckoutOrder(
      buildCheckoutPayload({
        items: [{ ...saleItem(), quantity: -1, restock: true }],
        shippingFee: 0,
        payments: [{ type: 'cash', name: '現金', amount: -100 }],
      })
    );
    const restocked = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]') as Product[];
    expect(restocked[0]?.stocks.find((row) => row.location === WAREHOUSE_ID)?.quantity).toBe(2);

    await checkout.createCheckoutOrder(
      buildCheckoutPayload({
        items: [{ ...saleItem(), quantity: -1, restock: false }],
        shippingFee: 0,
        payments: [{ type: 'cash', name: '現金', amount: -100 }],
      })
    );
    const skipped = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]') as Product[];
    expect(skipped[0]?.stocks.find((row) => row.location === WAREHOUSE_ID)?.quantity).toBe(2);
  });
});

describe('store stock location HTTP adapter', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
  });

  it('sends the store mapping routes and does not invent a location', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(input), init });
        const body = {
          name: '高雄店',
          isDefault: false,
          stockLocationId: WAREHOUSE_ID,
          stockLocationName: '後方倉庫',
        };
        return new Response(JSON.stringify(init?.method === 'GET' ? [body] : body), {
          status: init?.method === 'POST' ? 201 : 200,
          headers: { 'content-type': 'application/json' },
        });
      })
    );

    const service = new HttpSystemService();
    await service.getStores();
    await service.createStore({ name: '高雄店' });
    await service.updateStoreStockLocation('高雄店', { stockLocationId: WAREHOUSE_ID });

    expect(calls.map((call) => [call.init?.method || 'GET', call.url])).toEqual([
      ['GET', 'http://pos.test/api/v1/system/stores'],
      ['POST', 'http://pos.test/api/v1/system/stores'],
      ['PUT', 'http://pos.test/api/v1/system/stores/%E9%AB%98%E9%9B%84%E5%BA%97/stock-location'],
    ]);
    expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({ name: '高雄店' });
    expect(JSON.parse(String(calls[2]?.init?.body))).toEqual({ stockLocationId: WAREHOUSE_ID });
    vi.unstubAllGlobals();
  });
});
