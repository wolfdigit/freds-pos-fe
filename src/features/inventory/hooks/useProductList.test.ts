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
    const full = vi.spyOn(productService, 'searchProducts');
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
    expect(full).not.toHaveBeenCalled();
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
    const full = vi.spyOn(productService, 'searchProducts');
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
    expect(full).not.toHaveBeenCalled();
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
    vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params) => pageOf(params));
    const created = product('zzz-new');
    vi.spyOn(productService, 'getProductById').mockResolvedValue({ ...created, name: 'fresh' } as Product);
    const { result } = renderHook(() => useProductList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.pinProduct(created));
    expect(result.current.products[0].id).toBe('zzz-new');

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.products[0]).toMatchObject({ id: 'zzz-new', name: 'fresh' });
    expect(result.current.products).toHaveLength(51);
  });
});
