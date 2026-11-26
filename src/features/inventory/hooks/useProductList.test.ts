import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { productService } from '@/services';
import type { Product, ProductPageParams } from '@/types/product';
import { useProductList } from './useProductList';

function product(id: string): Product {
  return { id, sku: id, name: id, inventories: [] } as unknown as Product;
}

const catalog = Array.from({ length: 120 }, (_, index) => product(`p${String(index).padStart(3, '0')}`));

function pageOf({ page, pageSize }: ProductPageParams) {
  const start = (page - 1) * pageSize;
  return { items: catalog.slice(start, start + pageSize), page, pageSize, total: catalog.length };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useProductList', () => {
  it('loads one page at a time instead of the whole catalog', async () => {
    const paged = vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => pageOf(params));
    const { result } = renderHook(() => useProductList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products).toHaveLength(50);
    expect(result.current.total).toBe(120);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.products).toHaveLength(100);
    expect(paged).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, pageSize: 50 }));
  });

  it('reloads everything already shown in one request instead of jumping back to page one', async () => {
    const paged = vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => pageOf(params));
    const { result } = renderHook(() => useProductList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.loadMore();
    });
    paged.mockClear();

    await act(async () => {
      await result.current.reload();
    });
    expect(paged).toHaveBeenCalledTimes(1);
    expect(paged).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, pageSize: 100 }));
    expect(result.current.products).toHaveLength(100);
    expect(result.current.hasMore).toBe(true);
  });

  it('sends stock filters to the backend and still pages', async () => {
    const paged = vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => pageOf(params));
    const { result, rerender } = renderHook(({ stockFilters }) => useProductList({ stockFilters }), {
      initialProps: { stockFilters: { loginStoreQuantityMax: 2 } as Record<string, unknown> },
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(paged).toHaveBeenLastCalledWith(
      expect.objectContaining({ loginStoreQuantityMax: 2, page: 1, pageSize: 50 })
    );
    expect(result.current.hasMore).toBe(true);

    // 同樣內容的新物件不重查；內容改變才重查。
    paged.mockClear();
    rerender({ stockFilters: { loginStoreQuantityMax: 2 } });
    await act(async () => {});
    expect(paged).not.toHaveBeenCalled();
    rerender({ stockFilters: { inInventoryOnly: true } });
    await waitFor(() =>
      expect(paged).toHaveBeenLastCalledWith(expect.objectContaining({ inInventoryOnly: true, page: 1 }))
    );
    expect(paged.mock.calls.at(-1)?.[0]).not.toHaveProperty('loginStoreQuantityMax');
  });

  it('does not query while disabled', async () => {
    const paged = vi.spyOn(productService, 'searchProductPage');
    const { result } = renderHook(() => useProductList({ enabled: false }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(paged).not.toHaveBeenCalled();
  });

  it('keeps products with unsaved drafts visible when they are not in the filtered results', async () => {
    vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => pageOf(params));
    const drafted = product('zz-drafted');
    const onPage = catalog[0];
    const { result } = renderHook(() => useProductList({ keepVisible: [drafted, onPage] }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products[0].id).toBe('zz-drafted');
    expect(result.current.products.filter((row) => row.id === onPage.id)).toHaveLength(1);
    expect(result.current.products).toHaveLength(51);
  });

  it('keeps a newly created product visible even when it is not on a loaded page', async () => {
    const created = { ...product('zzz-new'), barcode: 'BC-NEW' } as Product;
    const paged = vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) =>
      params.keyword === 'zzz-new'
        ? { items: [{ ...created, name: 'fresh' } as Product], page: 1, pageSize: params.pageSize, total: 1 }
        : pageOf(params)
    );
    const byId = vi.spyOn(productService, 'getProductById');
    const { result } = renderHook(() => useProductList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.pinProduct(created));
    expect(result.current.products[0].id).toBe('zzz-new');

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.products[0]).toMatchObject({ id: 'zzz-new', name: 'fresh' });
    expect(result.current.products).toHaveLength(51);
    // 用列表 API 重讀（登入門市不帶 storeName），不用 GET /products/{id}。
    expect(paged).toHaveBeenCalledWith({ keyword: 'zzz-new', allProducts: true, page: 1, pageSize: 200 });
    expect(byId).not.toHaveBeenCalled();
  });

  it('refreshes pinned products with the selected store, falling back to the barcode, unlisted included', async () => {
    const created = { ...product('zzz-new'), barcode: 'BC-NEW', name: 'created' } as Product;
    const paged = vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) =>
      params.keyword === 'zzz-new' ? { items: [], page: 1, pageSize: params.pageSize, total: 0 } : pageOf(params)
    );
    const byBarcode = vi
      .spyOn(productService, 'getProductsByBarcode')
      .mockResolvedValue([{ ...created, name: 'popup', soldInLoginStore: false } as Product]);
    const { result } = renderHook(() => useProductList({ scope: { storeName: '台南快閃店' } }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.pinProduct(created));
    // 建立後馬上改用所選門市的資料（不在清單也留著，標示未販售）。
    await waitFor(() => expect(result.current.products[0]).toMatchObject({ name: 'popup', soldInLoginStore: false }));
    expect(paged).toHaveBeenCalledWith({
      keyword: 'zzz-new',
      storeName: '台南快閃店',
      allProducts: true,
      page: 1,
      pageSize: 200,
    });
    expect(byBarcode).toHaveBeenCalledWith('BC-NEW', { storeName: '台南快閃店', allProducts: true });
  });

  it('drops a pinned product that is gone, but keeps it when the refresh fails', async () => {
    const gone = { ...product('zzz-gone'), barcode: '' } as Product;
    const flaky = { ...product('zzz-flaky'), barcode: '' } as Product;
    vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => {
      if (params.keyword === 'zzz-gone') return { items: [], page: 1, pageSize: params.pageSize, total: 0 };
      if (params.keyword === 'zzz-flaky') throw new Error('offline');
      return pageOf(params);
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() => useProductList({ scope: { allProducts: true } }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.pinProduct(gone);
      result.current.pinProduct(flaky);
    });
    await waitFor(() => expect(result.current.products.some((row) => row.id === 'zzz-gone')).toBe(false));
    expect(result.current.products[0].id).toBe('zzz-flaky');
  });
});
