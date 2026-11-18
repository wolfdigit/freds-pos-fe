import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { productService } from '@/services';
import type { Product } from '@/types/product';
import { useProductSearch } from './useProductSearch';

function product(id: string): Product {
  return { id, name: id, inventories: [] } as unknown as Product;
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useProductSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits 300ms after the last keystroke and sends one request', async () => {
    const search = vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    const { result } = renderHook(() => useProductSearch());
    await act(async () => {});
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenLastCalledWith({ keyword: '', brand: 'ALL' });

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
    expect(search).toHaveBeenLastCalledWith({ keyword: 'QA-', brand: 'ALL' });
  });

  it('clears the keyword immediately and changes brand without waiting', async () => {
    const search = vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    const { result } = renderHook(() => useProductSearch());
    act(() => result.current.setKeyword('QA'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const before = search.mock.calls.length;

    await act(async () => result.current.setKeyword(''));
    expect(search).toHaveBeenCalledTimes(before + 1);
    expect(search).toHaveBeenLastCalledWith({ keyword: '', brand: 'ALL' });

    await act(async () => result.current.setBrand('Spark'));
    expect(search).toHaveBeenCalledTimes(before + 2);
    expect(search).toHaveBeenLastCalledWith({ keyword: '', brand: 'Spark' });
  });

  it('ignores an older response that arrives after the latest one', async () => {
    const slow = deferred<Product[]>();
    const search = vi
      .spyOn(productService, 'searchProducts')
      .mockImplementation(async ({ keyword }) => {
        if (keyword === 'Q') return slow.promise;
        if (keyword === 'QA') return [product('latest')];
        return [];
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

    await act(async () => slow.resolve([product('stale')]));
    expect(result.current.results.map((p) => p.id)).toEqual(['latest']);
    expect(result.current.isLoading).toBe(false);
    expect(search).toHaveBeenCalledTimes(3);
  });
});
