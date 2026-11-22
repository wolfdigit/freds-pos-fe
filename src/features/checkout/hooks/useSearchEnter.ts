import { useCallback, useLayoutEffect, useRef } from 'react';
import { productService } from '@/services';
import { PRODUCT_PAGE_SIZE, type Product } from '@/types/product';

export interface SearchEnterState {
  /** 搜尋框目前的文字（還沒 debounce 的）。 */
  keyword: string;
  brand: string;
  /** 畫面上目前的搜尋結果（可能還是上一個關鍵字的）。 */
  results: Product[];
  hasMore: boolean;
  /** results 是否就是 query 這個關鍵字查出來的。 */
  resultsMatch: (query: string) => boolean;
}

export interface SearchEnterOutcome {
  query: string;
  /** null：目前門市查無符合的商品。 */
  product: Product | null;
}

function exactMatcher(query: string) {
  const lower = query.toLowerCase();
  return (p: Product) =>
    p.barcode === query || p.sku.toLowerCase() === lower || (p.normalizedSku ?? '').toLowerCase() === lower;
}

async function lookupByBarcode(query: string): Promise<Product | null> {
  try {
    return (await productService.getProductsByBarcode(query)).find(exactMatcher(query)) ?? null;
  } catch {
    return null;
  }
}

/**
 * 結帳搜尋框按 Enter（或掃描槍送出）：永遠以「當下輸入框的文字」為準。
 *
 * - 畫面上的結果正好是這個關鍵字查出來的：沿用（完全相符優先，否則第一筆；只載入第一頁時再用條碼查一次）。
 * - 結果還是上一個關鍵字的（debounce 還沒到或查詢還沒回來）：不用舊結果，直接用目前文字查條碼，
 *   查不到再用同樣條件搜尋第一頁，規則跟等結果出來再按 Enter 一樣。
 * - 查詢途中使用者又改了輸入框：這次結果過時，丟掉不加。
 * - 前一次還在查時再按 Enter 會被忽略，不會重複加入。
 *
 * 只販售清單商品的門市，後端搜尋與條碼查詢都不會回清單外商品，所以會得到 product: null。
 */
export function useSearchEnter(state: SearchEnterState) {
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });
  const busy = useRef(false);

  return useCallback(async (): Promise<SearchEnterOutcome | null> => {
    const { keyword, brand, results, hasMore, resultsMatch } = stateRef.current;
    const query = keyword.trim();
    if (!query || busy.current) return null;
    busy.current = true;
    try {
      const isExact = exactMatcher(query);
      let product: Product | null = null;
      if (resultsMatch(query)) {
        product = results.find(isExact) ?? null;
        // 結果只載入了第一頁：條碼完全相符的商品可能在後面的頁。
        if (!product && hasMore) product = await lookupByBarcode(query);
        if (!product) product = results[0] ?? null;
      } else {
        product = await lookupByBarcode(query);
        if (!product) {
          try {
            const page = await productService.searchProductPage({
              keyword: query,
              brand,
              page: 1,
              pageSize: PRODUCT_PAGE_SIZE,
            });
            product = page.items.find(isExact) ?? page.items[0] ?? null;
          } catch {
            product = null;
          }
        }
      }
      // 查詢途中輸入框已經變了：這個結果屬於舊的文字，不採用。
      if (stateRef.current.keyword.trim() !== query) return null;
      if (product) {
        // 呼叫端會清空輸入框；在重新 render 前又按一次 Enter 也不會再加一次。
        stateRef.current = { ...stateRef.current, keyword: '' };
      }
      return { query, product };
    } finally {
      busy.current = false;
    }
  }, []);
}
