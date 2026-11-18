import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const liveConfig = {
  USE_MOCK: false,
  API_BASE_URL: 'http://pos.test/api/v1',
  API_TIMEOUT_MS: 5000,
  GOOGLE_CLIENT_ID: 'test-client',
};

window.__APP_CONFIG__ = liveConfig;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function product(id: string, quantity = 0) {
  return {
    id,
    sku: id,
    normalizedSku: id,
    barcode: id,
    brand: 'AutoArt',
    name: `車-${id}`,
    listPrice: 100,
    inventories: [{ location: 'loc-shelf', locationName: '門市現貨', quantity }],
    totalInventory: quantity,
    loginStoreQuantity: quantity,
    loginStoreReturnedQuantity: 0,
  };
}

let locations = [
  { id: 'loc-shelf', name: '門市現貨', displayOrder: 1, storeNames: ['奇可門市'], returnedStoreNames: [] },
  { id: 'loc-wh', name: '後方倉庫', displayOrder: 2, storeNames: [], returnedStoreNames: [] },
];

describe('inventory page stock filters', () => {
  const calls: string[] = [];

  beforeEach(async () => {
    calls.length = 0;
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = liveConfig;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        calls.push(`${init?.method ?? 'GET'} ${url.pathname}${url.search}`);
        if (url.pathname.endsWith('/inventory/locations')) return json(locations);
        if (url.pathname.endsWith('/system/stores')) return json([]);
        if (url.pathname.endsWith('/products')) {
          const low = url.searchParams.has('loginStoreQuantityMax');
          const items = low ? [product('LOW-1', 1)] : [product('ALL-1', 5), product('ALL-2', 9)];
          return json({ items, page: 1, pageSize: 50, total: items.length });
        }
        return json({ ok: true });
      })
    );
    const { invalidateStoreAndLocationCaches } = await import('@/services/api/sharedCaches');
    invalidateStoreAndLocationCaches();
    const { useSessionStore } = await import('@/store/sessionStore');
    useSessionStore.setState({ storeName: '奇可門市', userRole: 'admin' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    locations = [
      { id: 'loc-shelf', name: '門市現貨', displayOrder: 1, storeNames: ['奇可門市'], returnedStoreNames: [] },
      { id: 'loc-wh', name: '後方倉庫', displayOrder: 2, storeNames: [], returnedStoreNames: [] },
    ];
  });

  const productCalls = () => calls.filter((call) => call.startsWith('GET /api/v1/products'));

  it('maps every stock filter to a paged backend query instead of the full list', async () => {
    const { InventoryPage } = await import('./InventoryPage');
    const user = userEvent.setup();
    render(<InventoryPage />);
    expect(await screen.findByText('車-ALL-1')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    const expected: Array<[string, string]> = [
      ['STORE_LOW', 'loginStoreQuantityMax=2'],
      ['WAREHOUSE_LOW', 'locationId=loc-wh&locationQuantityMax=2'],
      ['STORE_OUT', 'loginStoreQuantityMin=0&loginStoreQuantityMax=0'],
      ['TOTAL_OUT', 'totalInventoryMin=0&totalInventoryMax=0'],
      ['HAS_STOCK', 'inInventoryOnly=true'],
    ];
    for (const [value, query] of expected) {
      await user.selectOptions(select, value);
      await waitFor(() =>
        expect(productCalls()).toContain(`GET /api/v1/products?${query}&page=1&pageSize=50`)
      );
    }
    expect(await screen.findByText('車-ALL-1')).toBeInTheDocument();
    // 沒有任何一次不分頁的 /products。
    expect(productCalls().every((call) => call.includes('page=1&pageSize=50'))).toBe(true);
  });

  it('shows nothing for warehouse low stock when there is no 後方倉庫, without a request', async () => {
    locations = [locations[0]];
    const { InventoryPage } = await import('./InventoryPage');
    const user = userEvent.setup();
    render(<InventoryPage />);
    expect(await screen.findByText('車-ALL-1')).toBeInTheDocument();
    const before = productCalls().length;
    await user.selectOptions(screen.getByRole('combobox'), 'WAREHOUSE_LOW');
    await waitFor(() => expect(screen.queryByText('車-ALL-1')).not.toBeInTheDocument());
    expect(productCalls()).toHaveLength(before);
  });

  it('keeps a product with an unsaved draft visible after switching to a filter it does not match', async () => {
    const { InventoryPage } = await import('./InventoryPage');
    const user = userEvent.setup();
    render(<InventoryPage />);
    expect(await screen.findByText('車-ALL-1')).toBeInTheDocument();
    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '7');
    expect(await screen.findByText(/已修改/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), 'STORE_LOW');
    expect(await screen.findByText('車-LOW-1')).toBeInTheDocument();
    expect(screen.getByText('車-ALL-1')).toBeInTheDocument();
    expect(screen.queryByText('車-ALL-2')).not.toBeInTheDocument();
    // 草稿仍算在待儲存的修改裡。
    expect(screen.getByText(/已修改/).textContent).toContain('1');
  });
});
