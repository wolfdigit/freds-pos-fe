import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

const LOCATIONS = [
  { id: 'loc-main', name: '奇可現貨', displayOrder: 1, storeNames: ['奇可門市'], returnedStoreNames: [], preorderStoreNames: [] },
  { id: 'loc-wh', name: '後方倉庫', displayOrder: 2, storeNames: [], returnedStoreNames: [], preorderStoreNames: [] },
  { id: 'loc-company', name: '公司總倉', displayOrder: 3, storeNames: [], returnedStoreNames: [], preorderStoreNames: [], systemRole: 'company' },
  { id: 'loc-defective', name: '退貨品', displayOrder: 5, storeNames: [], returnedStoreNames: ['奇可門市', '台南快閃店'], preorderStoreNames: [], systemRole: 'defective' },
  { id: 'loc-preorder', name: '預購保留', displayOrder: 6, storeNames: [], returnedStoreNames: [], preorderStoreNames: ['奇可門市', '台南快閃店'], systemRole: 'preorder' },
  { id: 'loc-popup', name: '快閃現貨', displayOrder: 7, storeNames: ['台南快閃店'], returnedStoreNames: [], preorderStoreNames: [] },
];

function store(name: string, shelf: string, productScope: 'all' | 'list') {
  return {
    name,
    inventoryLocationId: shelf,
    inventoryLocationName: shelf,
    returnedInventoryLocationId: 'loc-defective',
    returnedInventoryLocationName: '退貨品',
    preorderInventoryLocationId: 'loc-preorder',
    preorderInventoryLocationName: '預購保留',
    productScope,
  };
}

const STORES = [store('奇可門市', 'loc-main', 'all'), store('台南快閃店', 'loc-popup', 'list')];

function product(id: string, soldInLoginStore = true) {
  return {
    id,
    sku: id,
    normalizedSku: id,
    barcode: id,
    brand: 'AutoArt',
    name: `車-${id}`,
    listPrice: 100,
    inventories: LOCATIONS.map((location) => ({ location: location.id, locationName: location.name, quantity: 1 })),
    totalInventory: LOCATIONS.length,
    loginStoreQuantity: 1,
    loginStoreReturnedQuantity: 0,
    soldInLoginStore,
  };
}

describe('inventory page store filter', () => {
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
        if (url.pathname.endsWith('/inventory/locations')) return json(LOCATIONS);
        if (url.pathname.endsWith('/auth/stores')) return json(STORES);
        if (url.pathname.endsWith('/products')) {
          const popup = url.searchParams.get('storeName') === '台南快閃店';
          const all = url.searchParams.get('allProducts') === 'true';
          const items = popup ? [product('POP-1')] : all ? [product('ANY-1', false)] : [product('MAIN-1')];
          return json({ items, page: 1, pageSize: 50, total: items.length });
        }
        return json({ ok: true });
      })
    );
    const { invalidateStoreAndLocationCaches } = await import('@/services/api/sharedCaches');
    invalidateStoreAndLocationCaches();
    const { useSessionStore } = await import('@/store/sessionStore');
    useSessionStore.setState({ storeName: '奇可門市', userRole: 'staff' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const productCalls = () => calls.filter((call) => call.startsWith('GET /api/v1/products'));
  const headers = () =>
    screen
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent ?? '')
      .filter((text) => LOCATIONS.some((location) => location.name === text));

  it('replaces the brand tabs with login store, 全部商品, then other stores', async () => {
    const { InventoryPage } = await import('./InventoryPage');
    render(<InventoryPage />);
    expect(await screen.findByText('車-MAIN-1')).toBeInTheDocument();
    const tabs = screen.getByTestId('inventory-store-tabs');
    await waitFor(() =>
      expect(within(tabs).getAllByRole('button').map((button) => button.textContent)).toEqual([
        '奇可門市',
        '全部商品',
        '台南快閃店',
      ])
    );
    expect(screen.queryByText('全部品牌')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('顯示全部商品')).not.toBeInTheDocument();
    expect(screen.getByTestId('store-product-scope-hint')).toHaveTextContent('此門市販售全部商品');
    // 登入門市不帶 storeName，跟現在的後端相容。
    expect(productCalls()).toContain('GET /api/v1/products?page=1&pageSize=50');
    expect(headers()).toEqual(['奇可現貨', '預購保留', '退貨品', '公司總倉', '快閃現貨', '後方倉庫']);
  });

  it('switches products, location order, labels and restock to another store', async () => {
    const { InventoryPage } = await import('./InventoryPage');
    const user = userEvent.setup();
    render(<InventoryPage />);
    expect(await screen.findByText('車-MAIN-1')).toBeInTheDocument();
    const tabs = screen.getByTestId('inventory-store-tabs');
    await user.click(await within(tabs).findByRole('button', { name: '台南快閃店' }));

    expect(await screen.findByText('車-POP-1')).toBeInTheDocument();
    expect(productCalls()).toContain(
      `GET /api/v1/products?storeName=${encodeURIComponent('台南快閃店')}&page=1&pageSize=50`
    );
    expect(screen.getByTestId('store-product-scope-hint')).toHaveTextContent('僅顯示「台南快閃店」的可售商品');
    expect(headers()).toEqual(['快閃現貨', '預購保留', '退貨品', '公司總倉', '奇可現貨', '後方倉庫']);
    expect(screen.getByRole('columnheader', { name: '「台南快閃店」可售' })).toBeInTheDocument();

    // 門市低庫存篩選也跟著所選門市。
    await user.selectOptions(screen.getByRole('combobox'), 'STORE_LOW');
    await waitFor(() =>
      expect(productCalls()).toContain(
        `GET /api/v1/products?storeName=${encodeURIComponent('台南快閃店')}&loginStoreQuantityMax=2&page=1&pageSize=50`
      )
    );

    await user.click(screen.getByRole('button', { name: '快速條碼進貨' }));
    expect(await screen.findByTestId('restock-other-store-warning')).toHaveTextContent(
      '注意：目前進貨門市「台南快閃店」不是登入門市「奇可門市」'
    );
    const dialog = screen.getByRole('dialog');
    const target = within(dialog).getAllByRole('combobox')[0];
    expect(target).toHaveValue('loc-popup');
  });

  it('shows every product for 全部商品, ordered around the login store, restocking to the login store', async () => {
    const { InventoryPage } = await import('./InventoryPage');
    const user = userEvent.setup();
    render(<InventoryPage />);
    expect(await screen.findByText('車-MAIN-1')).toBeInTheDocument();
    await user.click(within(screen.getByTestId('inventory-store-tabs')).getByRole('button', { name: '全部商品' }));
    expect(await screen.findByText('車-ANY-1')).toBeInTheDocument();
    expect(productCalls()).toContain('GET /api/v1/products?allProducts=true&page=1&pageSize=50');
    expect(screen.getByTestId('store-product-scope-hint')).toHaveTextContent('顯示全部商品');
    expect(headers()[0]).toBe('奇可現貨');
    expect(screen.getByText('本門市未販售')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '快速條碼進貨' }));
    const dialog = await screen.findByRole('dialog');
    expect(screen.queryByTestId('restock-other-store-warning')).not.toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getAllByRole('combobox')[0]).toHaveValue('loc-main'));
  });
});
