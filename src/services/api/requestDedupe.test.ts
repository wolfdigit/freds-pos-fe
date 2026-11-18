import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpProductService } from './httpProductService';
import { HttpSystemService, STORE_RECORDS_TTL_MS, invalidateStoreRecords } from './httpSystemService';
import { HttpLocationService } from './httpLocationService';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const store = { name: '奇可門市', inventoryLocationId: 'loc-1', returnedInventoryLocationId: 'loc-1' };

describe('shared GET requests', () => {
  const calls: string[] = [];

  beforeEach(() => {
    calls.length = 0;
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
    invalidateStoreRecords();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        calls.push(`${init?.method ?? 'GET'} ${url.pathname}${url.search}`);
        if (url.pathname.endsWith('/system/stores') && (init?.method ?? 'GET') === 'GET') return json([store]);
        if (url.pathname.includes('/system/stores')) return json(store);
        if (url.pathname.includes('/inventory/locations')) return json({ deleted: true });
        return json([{ id: 'p1', inventories: [], loginStoreQuantity: 1 }]);
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('merges identical product searches that are in flight at the same time', async () => {
    const service = new HttpProductService();
    const [a, b] = await Promise.all([
      service.searchProducts({}),
      service.searchProducts({ keyword: '', brand: 'ALL' }),
    ]);
    expect(calls).toEqual(['GET /api/v1/products']);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);

    // 只合併進行中的請求，結束後再查會重新打 API，庫存不會是舊的。
    await service.searchProducts({});
    expect(calls).toHaveLength(2);
  });

  it('does not merge different keywords', async () => {
    const service = new HttpProductService();
    await Promise.all([service.searchProducts({ keyword: 'Q' }), service.searchProducts({ keyword: 'QA' })]);
    expect(calls).toEqual(['GET /api/v1/products?keyword=Q', 'GET /api/v1/products?keyword=QA']);
  });

  it('shares /system/stores between pages for a short time', async () => {
    const service = new HttpSystemService();
    const [first, second] = await Promise.all([service.getStores(), service.getStores()]);
    await service.getStores();
    expect(calls.filter((call) => call === 'GET /api/v1/system/stores')).toHaveLength(1);
    expect(first).toEqual([store]);
    expect(second).toEqual([store]);
  });

  it('refetches /system/stores after the TTL, on fresh, on a token change, and after mutations', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const service = new HttpSystemService();
    const storeReads = () => calls.filter((call) => call === 'GET /api/v1/system/stores').length;

    await service.getStores();
    vi.setSystemTime(Date.now() + STORE_RECORDS_TTL_MS + 1);
    await service.getStores();
    expect(storeReads()).toBe(2);

    await service.getStores({ fresh: true });
    expect(storeReads()).toBe(3);

    localStorage.setItem('AUTH_TOKEN', 'other-session');
    await service.getStores();
    expect(storeReads()).toBe(4);

    await service.rebindStore('奇可門市', { inventoryLocationId: 'loc-2', returnedInventoryLocationId: 'loc-2' });
    await service.getStores();
    expect(storeReads()).toBe(5);

    await new HttpLocationService().deleteLocation('loc-1', { rebindToLocation: 'loc-2' });
    await service.getStores();
    expect(storeReads()).toBe(6);
  });

  it('does not keep a failed /system/stores response', async () => {
    let fail = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls.push('GET /system/stores');
        if (fail) return json({ code: 'BOOM', message: '暫時失敗' }, 503);
        return json([store]);
      })
    );
    const service = new HttpSystemService();
    await expect(service.getStores()).rejects.toThrow();
    fail = false;
    await expect(service.getStores()).resolves.toEqual([store]);
    expect(calls).toHaveLength(2);
  });
});
