import { useCallback, useEffect, useRef, useState } from 'react';
import { productService } from '@/services';
import { MAX_PRODUCT_PAGE_SIZE as MAX_PAGE_SIZE, PRODUCT_PAGE_SIZE, type Product, type ProductSearchParams } from '@/types/product';

export interface PagedProductsOptions {
  pageSize?: number;
  /** false 時不送請求、清單為空（例如篩選需要的庫存點還沒讀到或不存在）。預設 true。 */
  enabled?: boolean;
  /** 篩選條件以外、也要觸發重新查詢的值（例如目前門市）。 */
  refreshKey?: unknown;
}

function mergeById(current: Product[], next: Product[]): Product[] {
  const seen = new Set(current.map((product) => product.id));
  return [...current, ...next.filter((product) => !seen.has(product.id))];
}

/**
 * 商品分頁清單：條件改變時從第一頁重抓，loadMore() 接著抓下一頁並接在後面。
 * 只有最後一次送出的查詢會更新畫面，較晚回來的舊回應直接丟掉。
 */
export function usePagedProducts(filters: ProductSearchParams, options: PagedProductsOptions = {}) {
  const pageSize = options.pageSize ?? PRODUCT_PAGE_SIZE;
  const enabled = options.enabled !== false;
  // 條件以內容比較：每次 render 傳進新的物件不會重查，內容改變才重查。
  const filterKey = JSON.stringify(filters);

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedPages, setLoadedPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const latest = useRef(0);
  const loadedPagesRef = useRef(0);
  const busyMore = useRef(false);

  const params = useCallback((): ProductSearchParams => JSON.parse(filterKey) as ProductSearchParams, [filterKey]);

  /** 重抓前 pages 頁（至少 1 頁）。條件改變時 pages = 1；重新整理時保留已載入的頁數。 */
  const fetchPages = useCallback(
    async (pages: number) => {
      latest.current += 1;
      const requestId = latest.current;
      busyMore.current = false;
      setIsLoadingMore(false);
      setIsLoading(true);
      setError(null);
      try {
        if (!enabled) {
          setItems([]);
          setTotal(0);
          loadedPagesRef.current = 0;
          setLoadedPages(0);
          return;
        }
        const count = Math.max(1, pages);
        // 重新整理時把已載入的範圍併成較少的請求（每次最多 MAX_PAGE_SIZE 筆）。
        const wanted = count * pageSize;
        const chunk = Math.min(MAX_PAGE_SIZE, wanted);
        const chunkPages = count === 1 ? 1 : Math.ceil(wanted / chunk);
        const results = await Promise.all(
          Array.from({ length: chunkPages }, (_, index) =>
            productService.searchProductPage({
              ...params(),
              page: index + 1,
              pageSize: count === 1 ? pageSize : chunk,
            })
          )
        );
        if (requestId !== latest.current) return;
        setItems(results.reduce<Product[]>((acc, page) => mergeById(acc, page.items), []).slice(0, wanted));
        setTotal(results[results.length - 1].total);
        loadedPagesRef.current = count;
        setLoadedPages(count);
      } catch (err) {
        if (requestId === latest.current) setError(err);
        throw err;
      } finally {
        if (requestId === latest.current) setIsLoading(false);
      }
    },
    [enabled, pageSize, params]
  );

  useEffect(() => {
    void fetchPages(1).catch((err) => console.error('Failed to load products:', err));
  }, [fetchPages, options.refreshKey]);

  const hasMore = enabled && items.length < total;

  const loadMore = useCallback(async () => {
    if (!enabled || busyMore.current || isLoading || items.length >= total) return;
    busyMore.current = true;
    const requestId = latest.current;
    const nextPage = loadedPagesRef.current + 1;
    setIsLoadingMore(true);
    try {
      const page = await productService.searchProductPage({ ...params(), page: nextPage, pageSize });
      if (requestId !== latest.current) return;
      setItems((current) => mergeById(current, page.items));
      setTotal(page.total);
      loadedPagesRef.current = nextPage;
      setLoadedPages(nextPage);
    } catch (err) {
      if (requestId === latest.current) console.error('Failed to load more products:', err);
    } finally {
      if (requestId === latest.current) {
        busyMore.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [enabled, isLoading, items.length, total, params, pageSize]);

  /** 重新查詢目前已載入的頁數（儲存、調撥等寫入之後用），清單不會縮回第一頁。 */
  const reload = useCallback(() => fetchPages(loadedPagesRef.current), [fetchPages]);

  return { items, total, hasMore, loadedPages, isLoading, isLoadingMore, error, loadMore, reload };
}
