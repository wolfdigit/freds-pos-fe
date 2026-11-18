import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CheckoutOrder } from '@/types/checkout';
import { HttpCheckoutService } from './httpCheckoutService';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function order(id: string, createdAt: string): CheckoutOrder {
  return {
    id,
    orderNumber: `SO-${id}`,
    cashierId: 'staff-001',
    cashierName: '店長 Fred',
    status: 'completed',
    items: [],
    itemsSubtotal: 0,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 0,
    payments: [],
    createdAt,
    updatedAt: createdAt,
  };
}

function page(items: CheckoutOrder[], total: number, pageNumber: number) {
  return { items, page: pageNumber, pageSize: 100, total };
}

describe('HttpCheckoutService.getOrderHistory', () => {
  const calls: string[] = [];

  beforeEach(() => {
    calls.length = 0;
    localStorage.clear();
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubPages(handler: (url: URL) => unknown) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input));
        calls.push(`${url.pathname}${url.search}`);
        return json(handler(url));
      })
    );
  }

  it('unwraps paged results so callers can sort the concatenated orders', async () => {
    const first = Array.from({ length: 100 }, (_, index) => order(`p1-${index}`, `2026-11-16T08:${String(index).padStart(2, '0')}:00.000Z`));
    const second = Array.from({ length: 100 }, (_, index) => order(`p2-${index}`, `2026-11-15T08:${String(index).padStart(2, '0')}:00.000Z`));
    const third = [order('p3-0', '2026-11-14T01:00:00.000Z')];
    stubPages((url) => {
      const pageNumber = Number(url.searchParams.get('page'));
      expect(url.searchParams.get('pageSize')).toBe('100');
      if (pageNumber === 1) return page(first, 201, 1);
      if (pageNumber === 2) return page(second, 201, 2);
      if (pageNumber === 3) return page(third, 201, 3);
      throw new Error(`unexpected page ${pageNumber}`);
    });

    const results = await new HttpCheckoutService().getOrderHistory();

    expect(calls).toEqual([
      '/api/v1/checkout/orders?page=1&pageSize=100',
      '/api/v1/checkout/orders?page=2&pageSize=100',
      '/api/v1/checkout/orders?page=3&pageSize=100',
    ]);
    expect(results.map((row) => row.id)).toEqual([...first, ...second, ...third].map((row) => row.id));
    expect(() => [...results].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))).not.toThrow();
  });

  it('stops when a later page is empty even if total is still larger', async () => {
    stubPages((url) => {
      const pageNumber = Number(url.searchParams.get('page'));
      if (pageNumber === 1) return page([order('only', '2026-11-16T00:00:00.000Z')], 50, 1);
      return page([], 50, pageNumber);
    });

    const results = await new HttpCheckoutService().getOrderHistory();

    expect(results.map((row) => row.id)).toEqual(['only']);
    expect(calls).toHaveLength(2);
  });

  it('sends product and amount filters, including zero amounts, and keeps them on later pages', async () => {
    stubPages((url) => {
      expect(url.searchParams.get('productKeyword')).toBe('鋼彈');
      expect(url.searchParams.get('minAmount')).toBe('0');
      expect(url.searchParams.get('maxAmount')).toBe('0');
      expect(url.searchParams.get('orderNumber')).toBe('SO-1');
      expect(url.searchParams.get('keyword')).toBe('陳');
      expect(url.searchParams.get('customerId')).toBe('cust-1');
      expect(url.searchParams.get('productId')).toBe('prod-1');
      expect(url.searchParams.get('startDate')).toBe('2026-11-16T00:00:00.000Z');
      expect(url.searchParams.get('endDate')).toBe('2026-11-17T00:00:00.000Z');
      expect(url.searchParams.get('status')).toBeNull();
      expect(url.searchParams.get('pageSize')).toBe('100');
      const pageNumber = Number(url.searchParams.get('page'));
      if (pageNumber === 1) return page([order('a', '2026-11-16T01:00:00.000Z')], 2, 1);
      if (pageNumber === 2) return page([order('b', '2026-11-16T00:00:00.000Z')], 2, 2);
      return page([], 2, pageNumber);
    });

    const results = await new HttpCheckoutService().getOrderHistory({
      productKeyword: '鋼彈',
      minAmount: 0,
      maxAmount: 0,
      orderNumber: 'SO-1',
      keyword: '陳',
      customerId: 'cust-1',
      productId: 'prod-1',
      startDate: '2026-11-16T00:00:00.000Z',
      endDate: '2026-11-17T00:00:00.000Z',
      status: 'all',
    });

    expect(results.map((row) => row.id)).toEqual(['a', 'b']);
    expect(calls).toHaveLength(2);
  });

  it('omits amount filters that were not provided and still pages a customer id string', async () => {
    stubPages((url) => {
      expect(url.searchParams.get('customerId')).toBe('member/1');
      expect(url.searchParams.has('minAmount')).toBe(false);
      expect(url.searchParams.has('maxAmount')).toBe(false);
      expect(url.searchParams.has('productKeyword')).toBe(false);
      expect(url.searchParams.get('status')).toBe('completed');
      return page([], 0, 1);
    });

    const results = await new HttpCheckoutService().getOrderHistory({
      customerId: 'member/1',
      status: 'completed',
    });
    expect(results).toEqual([]);
    expect(calls).toHaveLength(1);

    calls.length = 0;
    stubPages((url) => {
      expect(url.searchParams.get('customerId')).toBe('member-9');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('pageSize')).toBe('100');
      return page([order('m', '2026-11-16T03:00:00.000Z')], 1, 1);
    });

    const byCustomer = await new HttpCheckoutService().getOrderHistory('member-9');
    expect(byCustomer.map((row) => row.id)).toEqual(['m']);
  });

  it('rejects a bare order array instead of handing that object to callers', async () => {
    stubPages(() => [order('raw', '2026-11-16T00:00:00.000Z')]);

    await expect(new HttpCheckoutService().getOrderHistory()).rejects.toThrow('訂單列表回應不是分頁物件');
    expect(calls).toHaveLength(1);
  });
});

describe('HttpCheckoutService.createCheckoutOrder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the idempotency key with a longer, toast-free checkout timeout', async () => {
    const { httpClient } = await import('./httpClient');
    const { CHECKOUT_TIMEOUT_MS } = await import('./httpCheckoutService');
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ order: {} });

    await new HttpCheckoutService().createCheckoutOrder({ items: [], payments: [] } as never, 'key-1');

    expect(post).toHaveBeenCalledWith('/checkout/orders', { items: [], payments: [] }, {
      headers: { 'X-Idempotency-Key': 'key-1' },
      timeoutMs: CHECKOUT_TIMEOUT_MS,
      silentToast: true,
    });
    expect(CHECKOUT_TIMEOUT_MS).toBeGreaterThanOrEqual(45_000);
  });
});
