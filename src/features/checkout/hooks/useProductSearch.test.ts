import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { productService } from '@/services';
import type { Product, ProductPage, ProductPageParams } from '@/types/product';
import { useProductSearch } from './useProductSearch';

function product(id: string): Product {
  return { id, name: id, inventories: [] } as unknown as Product;
}

function page(ids: string[], total: number, pageNo = 1): ProductPage {
  return { items: ids.map(product), page: pageNo, pageSize: 50, total };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const firstPage = (keyword: string, brand = 'ALL') =>
  expect.objectContaining({ keyword, brand, page: 1, pageSize: 50 });

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits 300ms after the last keystroke and sends one paged request, never the full list', async () => {
    const search = vi.spyOn(productService, 'searchProductPage').mockResolvedValue(page([], 0));
    const { result } = renderHook(() => useProductSearch());
    await act(async () => {});
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenLastCalledWith(firstPage(''));

    act(() => result.current.setKeyword('Q'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setKeyword('QA'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setKeyword('QA-'));
    act(() => vi.advanceTimersByTime(299));
    expect(search).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(search).toHaveBeenCalledTimes(2);
    expect(search).toHaveBeenLastCalledWith(firstPage('QA-'));
  });

  it('clears the keyword immediately and changes brand without waiting', async () => {
    const search = vi.spyOn(productService, 'searchProductPage').mockResolvedValue(page([], 0));
    const { result } = renderHook(() => useProductSearch());
    act(() => result.current.setKeyword('QA'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const before = search.mock.calls.length;

    await act(async () => result.current.setKeyword(''));
    expect(search).toHaveBeenCalledTimes(before + 1);
    expect(search).toHaveBeenLastCalledWith(firstPage(''));

    await act(async () => result.current.setBrand('Spark'));
    expect(search).toHaveBeenCalledTimes(before + 2);
    expect(search).toHaveBeenLastCalledWith(firstPage('', 'Spark'));
  });

  it('ignores an older response that arrives after the latest one', async () => {
    const slow = deferred<ProductPage>();
    const search = vi
      .spyOn(productService, 'searchProductPage')
      .mockImplementation(async ({ keyword }: ProductPageParams) => {
        if (keyword === 'Q') return slow.promise;
        if (keyword === 'QA') return page(['latest'], 1);
        return page([], 0);
      });
    const { result } = renderHook(() => useProductSearch());
    act(() => result.current.setKeyword('Q'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    act(() => result.current.setKeyword('QA'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.results.map((p) => p.id)).toEqual(['latest']);

    await act(async () => slow.resolve(page(['stale'], 1)));
    expect(result.current.results.map((p) => p.id)).toEqual(['latest']);
    expect(result.current.isLoading).toBe(false);
    expect(search).toHaveBeenCalledTimes(3);
  });

  it('loads the next page on demand and appends it', async () => {
    const search = vi
      .spyOn(productService, 'searchProductPage')
      .mockImplementation(async ({ page: pageNo }: ProductPageParams) =>
        pageNo === 1 ? page(['a', 'b'], 3) : page(['c'], 3, pageNo)
      );
    const { result } = renderHook(() => useProductSearch());
    await act(async () => {});
    expect(result.current.results.map((p) => p.id)).toEqual(['a', 'b']);
    expect(result.current.total).toBe(3);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: '', page: 2, pageSize: 50 }));
    expect(result.current.results.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(result.current.hasMore).toBe(false);

    // 已經全部載入，不再送請求。
    await act(async () => {
      await result.current.loadMore();
    });
    expect(search).toHaveBeenCalledTimes(2);
  });

  it('drops a next-page response that arrives after the keyword changed', async () => {
    const pageTwo = deferred<ProductPage>();
    vi.spyOn(productService, 'searchProductPage').mockImplementation(
      async ({ keyword, page: pageNo }: ProductPageParams) => {
        if (keyword === '' && pageNo === 1) return page(['a'], 2);
        if (keyword === '' && pageNo === 2) return pageTwo.promise;
        return page(['new'], 1);
      }
    );
    const { result } = renderHook(() => useProductSearch());
    await act(async () => {});
    let more: Promise<void> = Promise.resolve();
    act(() => {
      more = result.current.loadMore();
    });
    act(() => result.current.setKeyword('NEW'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.results.map((p) => p.id)).toEqual(['new']);

    await act(async () => {
      pageTwo.resolve(page(['old-page-2'], 2, 2));
      await more;
    });
    expect(result.current.results.map((p) => p.id)).toEqual(['new']);
    expect(result.current.isLoadingMore).toBe(false);
  });
});
