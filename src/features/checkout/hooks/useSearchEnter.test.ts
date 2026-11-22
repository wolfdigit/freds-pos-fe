import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { productService } from '@/services';
import type { Product, ProductPage, ProductPageParams } from '@/types/product';
import { useProductSearch } from './useProductSearch';
import { useSearchEnter } from './useSearchEnter';

function product(sku: string, barcode = `BAR-${sku}`, brand = sku.startsWith('OLD') ? 'TOMICA' : 'MINIGT'): Product {
  return {
    id: `prod-${sku}`,
    sku,
    brand,
    normalizedSku: sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
    barcode,
    name: `QA-${sku}`,
    inventories: [],
  } as unknown as Product;
}

const CATALOG = [product('OLD-1', '4710000000011'), product('NEW-2', '4710000000028'), product('NEW-22')];

function page(items: Product[], total = items.length): ProductPage {
  return { items, page: 1, pageSize: 50, total };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** 結帳頁的組合：搜尋 hook + Enter 處理。 */
function useCheckoutSearch() {
  const search = useProductSearch();
  const resolve = useSearchEnter({
    keyword: search.keyword,
    brand: search.brand,
    results: search.results,
    hasMore: search.hasMore,
    resultsMatch: search.resultsMatch,
  });
  return { ...search, resolve };
}

function fuzzy(keyword: string, brand?: string) {
  const q = keyword.trim().toUpperCase();
  return CATALOG.filter(
    (p) => (!brand || brand === 'ALL' || p.brand === brand) && (!q || p.sku.includes(q) || p.barcode.includes(q))
  );
}

describe('checkout search Enter', () => {
  let searchSpy: ReturnType<typeof vi.spyOn>;
  let barcodeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    searchSpy = vi
      .spyOn(productService, 'searchProductPage')
      .mockImplementation(async (params: ProductPageParams) => page(fuzzy(params.keyword ?? '', params.brand)));
    barcodeSpy = vi
      .spyOn(productService, 'getProductsByBarcode')
      .mockImplementation(async (code: string) => CATALOG.filter((p) => p.barcode === code.trim()));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function settle(result: { current: ReturnType<typeof useCheckoutSearch> }, keyword: string) {
    act(() => result.current.setKeyword(keyword));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
  }

  it('uses the current text, not the stale results, when Enter beats the debounce', async () => {
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    await settle(result, 'OLD-1');
    expect(result.current.results.map((p) => p.sku)).toEqual(['OLD-1']);
    expect(result.current.resultsMatch('OLD-1')).toBe(true);

    // 掃描槍：打完新條碼立刻 Enter，300ms 還沒到，畫面上還是 OLD-1。
    act(() => result.current.setKeyword('4710000000028'));
    expect(result.current.results.map((p) => p.sku)).toEqual(['OLD-1']);
    expect(result.current.resultsMatch('4710000000028')).toBe(false);
    let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: '4710000000028', product: expect.objectContaining({ sku: 'NEW-2' }) });
    expect(barcodeSpy).toHaveBeenCalledWith('4710000000028');
  });

  it('looks up a typed SKU with a fresh search when results are still loading', async () => {
    const slow = deferred<ProductPage>();
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    await settle(result, 'OLD-1');

    // 新關鍵字的 debounce 已到、查詢送出但還沒回來。
    searchSpy.mockImplementationOnce(() => slow.promise);
    await settle(result, 'new-22');
    expect(result.current.resultsMatch('new-22')).toBe(false);
    let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: 'new-22', product: expect.objectContaining({ sku: 'NEW-22' }) });
    // 晚回來的舊回應不影響結果。
    await act(async () => slow.resolve(page([CATALOG[0]])));
  });

  it('still uses the settled results for a single match', async () => {
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    await settle(result, 'NEW-22');
    searchSpy.mockClear();
    let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: 'NEW-22', product: expect.objectContaining({ sku: 'NEW-22' }) });
    // 結果已對應目前文字，不必再查。
    expect(searchSpy).not.toHaveBeenCalled();
    expect(barcodeSpy).not.toHaveBeenCalled();
  });

  it('reports not found for an unknown code, even if stale results are on screen', async () => {
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    await settle(result, 'OLD-1');
    act(() => result.current.setKeyword('9999999999999'));
    let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: '9999999999999', product: null });

    // 等結果出來後再按也一樣查無。
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: '9999999999999', product: null });
  });

  it('treats products the list store does not sell as not found', async () => {
    // 只販售清單商品的門市：後端搜尋與條碼查詢都不回清單外商品。
    searchSpy.mockImplementation(async () => page([]));
    barcodeSpy.mockImplementation(async () => []);
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    act(() => result.current.setKeyword('4710000000028'));
    let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
    await act(async () => {
      outcome = await result.current.resolve();
    });
    expect(outcome).toEqual({ query: '4710000000028', product: null });
  });

  it('ignores a second Enter while the first lookup is in flight', async () => {
    const slow = deferred<Product[]>();
    barcodeSpy.mockImplementationOnce(() => slow.promise);
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    act(() => result.current.setKeyword('4710000000028'));
    let first: Promise<unknown> = Promise.resolve();
    let second: unknown = 'pending';
    await act(async () => {
      first = result.current.resolve();
      second = await result.current.resolve();
    });
    expect(second).toBeNull();
    await act(async () => {
      slow.resolve([CATALOG[1]]);
      await first;
    });
    expect(await first).toEqual({ query: '4710000000028', product: expect.objectContaining({ sku: 'NEW-2' }) });
    // 呼叫端還沒清空輸入框前再按一次也不會重複加入。
    let third: unknown = 'pending';
    await act(async () => {
      third = await result.current.resolve();
    });
    expect(third).toBeNull();
  });

  it('drops the answer when the input changed during the lookup', async () => {
    const slow = deferred<Product[]>();
    barcodeSpy.mockImplementationOnce(() => slow.promise);
    const { result } = renderHook(() => useCheckoutSearch());
    await act(async () => {});
    act(() => result.current.setKeyword('4710000000028'));
    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = result.current.resolve();
    });
    act(() => result.current.setKeyword('4710000000011'));
    await act(async () => {
      slow.resolve([CATALOG[1]]);
    });
    expect(await pending).toBeNull();
  });

  describe('brand tab never filters exact barcode / SKU matches', () => {
    async function pressEnter(result: { current: ReturnType<typeof useCheckoutSearch> }) {
      let outcome: Awaited<ReturnType<typeof result.current.resolve>> = null;
      await act(async () => {
        outcome = await result.current.resolve();
      });
      return outcome;
    }

    it('finds another brand by barcode when the settled results are brand-filtered', async () => {
      const { result } = renderHook(() => useCheckoutSearch());
      await act(async () => {});
      act(() => result.current.setBrand('TOMICA'));
      await settle(result, '4710000000028');
      // 畫面上是 TOMICA 的結果，沒有這個 MINIGT 條碼。
      expect(result.current.resultsMatch('4710000000028')).toBe(true);
      expect(result.current.results).toEqual([]);
      expect(await pressEnter(result)).toEqual({
        query: '4710000000028',
        product: expect.objectContaining({ sku: 'NEW-2', brand: 'MINIGT' }),
      });
    });

    it('finds another brand by SKU when the settled results are brand-filtered', async () => {
      const { result } = renderHook(() => useCheckoutSearch());
      await act(async () => {});
      act(() => result.current.setBrand('TOMICA'));
      await settle(result, 'new-22');
      expect(result.current.results).toEqual([]);
      expect(await pressEnter(result)).toEqual({ query: 'new-22', product: expect.objectContaining({ sku: 'NEW-22' }) });
      expect(searchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: 'new-22', brand: 'ALL' }));
    });

    it('finds another brand by barcode and SKU when Enter beats the debounce', async () => {
      const { result } = renderHook(() => useCheckoutSearch());
      await act(async () => {});
      act(() => result.current.setBrand('TOMICA'));
      await settle(result, 'OLD-1');

      act(() => result.current.setKeyword('4710000000028'));
      expect(await pressEnter(result)).toEqual({ query: '4710000000028', product: expect.objectContaining({ sku: 'NEW-2' }) });

      act(() => result.current.setKeyword('NEW-22'));
      expect(await pressEnter(result)).toEqual({ query: 'NEW-22', product: expect.objectContaining({ sku: 'NEW-22' }) });
    });

    it('keeps the brand for the free-text fallback', async () => {
      const { result } = renderHook(() => useCheckoutSearch());
      await act(async () => {});
      act(() => result.current.setBrand('TOMICA'));
      await settle(result, 'OLD-1');
      // 「NEW」不是完整條碼或貨號：模糊比對維持目前品牌，TOMICA 底下沒有。
      act(() => result.current.setKeyword('NEW'));
      expect(await pressEnter(result)).toEqual({ query: 'NEW', product: null });
      expect(searchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ keyword: 'NEW', brand: 'TOMICA' }));
    });
  });
});
