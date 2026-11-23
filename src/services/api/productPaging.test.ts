import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpProductService } from './httpProductService';
import { HttpLocationService, invalidateLocations } from './httpLocationService';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function row(id: string, barcode = id, inventories: unknown[] = []) {
  return { id, sku: id, barcode, inventories, loginStoreQuantity: 1, loginStoreReturnedQuantity: 0 };
}

type Handler = (url: URL) => Response;

describe('paged product and stock summary requests', () => {
  const calls: string[] = [];
  let handler: Handler;

  beforeEach(() => {
    calls.length = 0;
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
    invalidateLocations();
    handler = () => json([]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        calls.push(`${init?.method ?? 'GET'} ${url.pathname}${url.search}`);
        return handler(url);
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends page and pageSize with the filters and reads the paged body', async () => {
    handler = () => json({ items: [row('p3')], page: 2, pageSize: 2, total: 3 });
    const result = await new HttpProductService().searchProductPage({
      keyword: 'ferrari',
      brand: 'AutoArt',
      page: 2,
      pageSize: 2,
    });
    expect(calls).toEqual(['GET /api/v1/products?keyword=ferrari&brand=AutoArt&page=2&pageSize=2']);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.items.map((p) => p.id)).toEqual(['p3']);
  });

  it('rejects a bare array instead of paging it on the client', async () => {
    handler = () => json([row('a'), row('b'), row('c')]);
    await expect(new HttpProductService().searchProductPage({ page: 1, pageSize: 50 })).rejects.toThrow(
      '商品列表回應不是分頁物件'
    );
  });

  it('sends stock filters with the page request and keeps the paged body', async () => {
    handler = () =>
      json({
        items: [
          { ...row('a'), loginStoreQuantity: 0, totalInventory: 4 },
          { ...row('c'), loginStoreQuantity: 2, totalInventory: 0 },
        ],
        page: 1,
        pageSize: 50,
        total: 2,
      });
    const result = await new HttpProductService().searchProductPage({
      loginStoreQuantityMax: 2,
      page: 1,
      pageSize: 50,
    });
    expect(calls).toEqual(['GET /api/v1/products?loginStoreQuantityMax=2&page=1&pageSize=50']);
    expect(result.items.map((p) => p.id)).toEqual(['a', 'c']);
    expect(result.total).toBe(2);
  });

  it('merges identical page requests that are in flight together', async () => {
    handler = () => json({ items: [row('a')], page: 1, pageSize: 50, total: 1 });
    const service = new HttpProductService();
    const [a, b] = await Promise.all([
      service.searchProductPage({ page: 1, pageSize: 50 }),
      service.searchProductPage({ keyword: '', brand: 'ALL', page: 1, pageSize: 50 }),
    ]);
    expect(calls).toEqual(['GET /api/v1/products?page=1&pageSize=50']);
    expect(a).toEqual(b);
  });

  it('looks up same-barcode products with a paged exact barcode query', async () => {
    handler = () => json({ items: [row('p1', '4710001'), row('p3', '4710001')], page: 1, pageSize: 200, total: 2 });
    const result = await new HttpProductService().getProductsByBarcode(' 4710001 ');
    expect(calls).toEqual(['GET /api/v1/products?barcode=4710001&page=1&pageSize=200']);
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(await new HttpProductService().getProductsByBarcode('  ')).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  it('sends allProducts with the paged barcode query when asked', async () => {
    handler = () => json({ items: [row('p9', '4710001')], page: 1, pageSize: 200, total: 1 });
    const result = await new HttpProductService().getProductsByBarcode('4710001', { allProducts: true });
    expect(calls).toEqual(['GET /api/v1/products?allProducts=true&barcode=4710001&page=1&pageSize=200']);
    expect(result.map((p) => p.id)).toEqual(['p9']);
  });

  it('reads the per-location summary without fetching products', async () => {
    const summary = [{ locationId: 'loc-1', locationName: '門市', totalQuantity: 3, productCount: 2, hasNonZeroStock: true }];
    handler = () => json(summary);
    expect(await new HttpLocationService().getStockSummary()).toEqual(summary);
    expect(calls).toEqual(['GET /api/v1/inventory/locations/summary']);
  });

  it('propagates summary errors, including a missing endpoint', async () => {
    handler = () => json({ detail: 'Method Not Allowed' }, 405);
    await expect(new HttpLocationService().getStockSummary()).rejects.toMatchObject({ status: 405 });
    expect(calls).toEqual(['GET /api/v1/inventory/locations/summary']);

    calls.length = 0;
    handler = () => json({ detail: 'boom' }, 500);
    await expect(new HttpLocationService().getStockSummary()).rejects.toMatchObject({ status: 500 });
    expect(calls).toEqual(['GET /api/v1/inventory/locations/summary']);
  });
});
