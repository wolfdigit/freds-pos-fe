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

  it('slices the page itself when an older backend ignores paging and returns the whole array', async () => {
    handler = () => json([row('a'), row('b'), row('c'), row('d'), row('e')]);
    const result = await new HttpProductService().searchProductPage({ page: 2, pageSize: 2 });
    expect(result).toMatchObject({ page: 2, pageSize: 2, total: 5 });
    expect(result.items.map((p) => p.id)).toEqual(['c', 'd']);
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

  it('looks up same-barcode products by exact barcode and still filters an old full-list reply', async () => {
    handler = () => json([row('p1', '4710001'), row('p2', '47100012'), row('p3', '4710001')]);
    const result = await new HttpProductService().getProductsByBarcode(' 4710001 ');
    expect(calls).toEqual(['GET /api/v1/products?barcode=4710001']);
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
    expect(await new HttpProductService().getProductsByBarcode('  ')).toEqual([]);
    expect(calls).toHaveLength(1);
  });

  it('reads the per-location summary without fetching products', async () => {
    const summary = [{ locationId: 'loc-1', locationName: '門市', totalQuantity: 3, productCount: 2, hasNonZeroStock: true }];
    handler = () => json(summary);
    expect(await new HttpLocationService().getStockSummary()).toEqual(summary);
    expect(calls).toEqual(['GET /api/v1/inventory/locations/summary']);
  });

  it('falls back to summing /products when the backend has no summary endpoint yet', async () => {
    handler = (url) => {
      if (url.pathname.endsWith('/inventory/locations/summary')) return json({ detail: 'Method Not Allowed' }, 405);
      if (url.pathname.endsWith('/inventory/locations')) {
        return json([
          { id: 'loc-1', name: '門市', displayOrder: 1 },
          { id: 'loc-2', name: '倉庫', displayOrder: 2 },
        ]);
      }
      return json([
        row('a', 'a', [
          { location: 'loc-1', locationName: '門市', quantity: 5 },
          { location: 'loc-2', locationName: '倉庫', quantity: -1 },
        ]),
        row('b', 'b', [{ location: 'loc-1', locationName: '門市', quantity: 0 }]),
      ]);
    };
    const result = await new HttpLocationService().getStockSummary();
    expect(result).toEqual([
      { locationId: 'loc-1', locationName: '門市', totalQuantity: 5, productCount: 1, hasNonZeroStock: true },
      { locationId: 'loc-2', locationName: '倉庫', totalQuantity: -1, productCount: 1, hasNonZeroStock: true },
    ]);
    expect(calls).toContain('GET /api/v1/products');
  });

  it('does not hide other summary errors behind the fallback', async () => {
    handler = () => json({ detail: 'boom' }, 500);
    await expect(new HttpLocationService().getStockSummary()).rejects.toMatchObject({ status: 500 });
    expect(calls).toEqual(['GET /api/v1/inventory/locations/summary']);
  });
});
