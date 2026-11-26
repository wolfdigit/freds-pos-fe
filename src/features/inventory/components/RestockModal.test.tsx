import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Product, ProductPage, ProductPageParams } from '@/types/product';

const searchProductPage = vi.fn();
const getProductsByBarcode = vi.fn();
vi.mock('@/services', () => ({
  productService: {
    searchProductPage: (...args: unknown[]) => searchProductPage(...args),
    getProductsByBarcode: (...args: unknown[]) => getProductsByBarcode(...args),
  },
}));
const mockLocations = vi.hoisted(() => ({ value: [] as Array<{ id: string; name: string }> }));
vi.mock('../hooks/useLocations', () => ({ useLocations: () => ({ locations: mockLocations.value }) }));
vi.mock('@/hooks/useBarcodeSiblings', () => ({ useBarcodeSiblings: () => ({}) }));

import { useToastStore } from '@/components/feedback/toastStore';
import { RestockModal } from './RestockModal';

function product(sku: string, barcode = `BAR-${sku}`, brand = 'MINIGT'): Product {
  return {
    id: `prod-${sku}`,
    sku,
    normalizedSku: sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
    barcode,
    brand,
    name: `QA-${sku}`,
    inventories: [],
  } as unknown as Product;
}

const CATALOG = [product('OLD-1', '4710000000011', 'TOMICA'), product('NEW-2', '4710000000028'), product('NEW-22')];

function fuzzy(keyword: string) {
  const q = keyword.trim().toUpperCase();
  return CATALOG.filter((p) => p.sku.includes(q) || p.barcode.includes(q));
}

function page(items: Product[], params: ProductPageParams, total = items.length): ProductPage {
  return { items, page: params.page, pageSize: params.pageSize, total };
}

function toasts() {
  return useToastStore.getState().toasts.map((t) => t.message);
}

function input() {
  return screen.getByPlaceholderText('掃碼槍掃描條碼或輸入貨號...');
}

async function typeAndSettle(value: string) {
  fireEvent.change(input(), { target: { value } });
  await waitFor(() =>
    expect(searchProductPage).toHaveBeenCalledWith(expect.objectContaining({ keyword: value, page: 1 }))
  );
}

describe('RestockModal 商品搜尋', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    searchProductPage.mockImplementation(async (params: ProductPageParams) => page(fuzzy(params.keyword ?? ''), params));
    getProductsByBarcode.mockImplementation(async (code: string) => CATALOG.filter((p) => p.barcode === code.trim()));
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockLocations.value = [];
  });

  it('searches one server page at a time and loads more on demand', async () => {
    const many = Array.from({ length: 120 }, (_, i) => product(`QA-${String(i).padStart(3, '0')}`));
    searchProductPage.mockImplementation(async (params: ProductPageParams) => {
      const start = (params.page - 1) * params.pageSize;
      return page(many.slice(start, start + params.pageSize), params, many.length);
    });
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    await typeAndSettle('QA');
    expect(searchProductPage).toHaveBeenCalledWith({ keyword: 'QA', page: 1, pageSize: 50 });
    expect(await screen.findByText('已顯示 50 / 共 120 項')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '載入更多' }));
    expect(await screen.findByText('已顯示 100 / 共 120 項')).toBeInTheDocument();
    expect(searchProductPage).toHaveBeenLastCalledWith({ keyword: 'QA', page: 2, pageSize: 50 });
  });

  it('skips the store product list only when the inventory page shows all products', async () => {
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} scope={{ allProducts: true }} />);
    await typeAndSettle('NEW');
    expect(searchProductPage).toHaveBeenCalledWith({ keyword: 'NEW', allProducts: true, page: 1, pageSize: 50 });
  });

  it('searches and scans with the store picked on the inventory page', async () => {
    render(
      <RestockModal
        open
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        scope={{ storeName: '台南快閃店' }}
        targetStoreName="台南快閃店"
        loginStoreName="奇可門市"
      />
    );
    await typeAndSettle('OLD');
    expect(searchProductPage).toHaveBeenCalledWith({
      keyword: 'OLD',
      storeName: '台南快閃店',
      page: 1,
      pageSize: 50,
    });
    fireEvent.change(input(), { target: { value: '4710000000028' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain('已加入進貨: NEW-2 (1台)'));
    expect(getProductsByBarcode).toHaveBeenCalledWith('4710000000028', { storeName: '台南快閃店' });
  });

  it('defaults to the target store sellable location and warns when it is not the login store', async () => {
    mockLocations.value = [
      { id: 'loc-main', name: '門市現貨' },
      { id: 'loc-popup', name: '快閃店現貨' },
    ];
    const { rerender } = render(
      <RestockModal
        open
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        scope={{ storeName: '台南快閃店' }}
        targetStoreName="台南快閃店"
        defaultLocationId="loc-popup"
        loginStoreName="奇可門市"
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('loc-popup');
    expect(screen.getByTestId('restock-other-store-warning')).toHaveTextContent(
      '注意：目前進貨門市「台南快閃店」不是登入門市「奇可門市」'
    );
    // 目標地點仍可以改。
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'loc-main' } });
    expect(screen.getByRole('combobox')).toHaveValue('loc-main');

    rerender(
      <RestockModal
        open
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        targetStoreName="奇可門市"
        defaultLocationId="loc-main"
        loginStoreName="奇可門市"
      />
    );
    expect(screen.queryByTestId('restock-other-store-warning')).not.toBeInTheDocument();
  });

  it('adds the scanned barcode, not the stale results, when Enter beats the debounce', async () => {
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    await typeAndSettle('OLD-1');
    expect(await screen.findByText('QA-OLD-1')).toBeInTheDocument();

    // 掃描槍：新條碼打完立刻 Enter，畫面上還是 OLD-1 的結果。
    fireEvent.change(input(), { target: { value: '4710000000028' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain('已加入進貨: NEW-2 (1台)'));
    expect(getProductsByBarcode).toHaveBeenCalledWith('4710000000028', undefined);
    expect(screen.getByText('待入庫進貨批次清單 (1 項)')).toBeInTheDocument();
    expect(input()).toHaveValue('');
  });

  it('prefers the exact barcode / SKU match over the first fuzzy result', async () => {
    searchProductPage.mockImplementation(async (params: ProductPageParams) =>
      page([CATALOG[2], CATALOG[1]].filter((p) => p.sku.includes((params.keyword ?? '').toUpperCase())), params)
    );
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    await typeAndSettle('new-2');
    expect(await screen.findByText('QA-NEW-22')).toBeInTheDocument();
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '3' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain('已加入進貨: NEW-2 (3台)'));
  });

  it('finds an exact SKU of any brand when Enter is pressed before results arrive', async () => {
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(input(), { target: { value: 'old-1' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain('已加入進貨: OLD-1 (1台)'));
    expect(searchProductPage).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'old-1', brand: 'ALL' }));
  });

  it('reports an unknown code as not found', async () => {
    render(<RestockModal open onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(input(), { target: { value: '9999999999999' } });
    fireEvent.keyDown(input(), { key: 'Enter' });
    await waitFor(() => expect(toasts()).toContain('找不到條碼/貨號「9999999999999」對應的商品'));
    expect(screen.getByText('待入庫進貨批次清單 (0 項)')).toBeInTheDocument();
  });
});
