import { useCallback, useLayoutEffect, useRef } from 'react';
import { productService } from '@/services';
import { PRODUCT_PAGE_SIZE, type Product } from '@/types/product';
import { exactProductMatcher, findExactProduct } from '@/utils/productLookup';

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

/**
 * 結帳搜尋框按 Enter（或掃描槍送出）：永遠以「當下輸入框的文字」為準。
 *
 * 完全相符（條碼或貨號）的比對**不受品牌標籤影響**：畫面上的結果可能只有目前品牌，
 * 在裡面找不到時一律用不分品牌的查詢再找一次（findExactProduct）。
 *
 * - 畫面上的結果正好是這個關鍵字查出來的：完全相符優先；沒有的話，若結果不完整（有選品牌或還有下一頁）
 *   先做不分品牌的完全比對；都沒有才用畫面上第一筆（模糊比對，維持目前品牌篩選）。
 * - 結果還是上一個關鍵字的（debounce 還沒到或查詢還沒回來）：不用舊結果，先做不分品牌的完全比對，
 *   沒有的話用目前品牌搜尋第一頁取第一筆（模糊比對，跟等結果出來再按 Enter 一樣）。
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
      const isExact = exactProductMatcher(query);
      let product: Product | null = null;
      if (resultsMatch(query)) {
        product = results.find(isExact) ?? null;
        // 畫面上的結果被品牌篩過或只載入第一頁：完全相符的商品可能不在裡面，用不分品牌的查詢再找。
        if (!product && (brand !== 'ALL' || hasMore)) product = (await findExactProduct(query)).exact;
        if (!product) product = results[0] ?? null;
      } else {
        const lookup = await findExactProduct(query);
        product = lookup.exact;
        if (!product) {
          if (brand === 'ALL' && lookup.page) {
            product = lookup.page.items[0] ?? null;
          } else {
            try {
              const page = await productService.searchProductPage({
                keyword: query,
                brand,
                page: 1,
                pageSize: PRODUCT_PAGE_SIZE,
              });
              product = page.items[0] ?? null;
            } catch {
              product = null;
            }
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
