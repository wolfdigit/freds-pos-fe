import { useCallback, useEffect, useMemo, useState } from 'react';
import { storeScopeParams, type Product, type ProductSearchParams, type ProductStoreScope } from '@/types/product';
import { productService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagedProducts } from '@/hooks/usePagedProducts';

export interface ProductListOptions {
  /** 庫存狀況篩選（低庫存、缺貨、有現貨），由後端篩完再分頁。 */
  stockFilters?: ProductSearchParams;
  /** false 時不查詢（例如篩選需要的庫存點不存在）。 */
  enabled?: boolean;
  /**
   * 不管目前篩選條件都要留在畫面上的商品（例如有未儲存庫存草稿的商品）。
   * 不在已載入結果裡的會顯示在最前面。
   */
  keepVisible?: Product[];
  /** 看哪間門市的商品清單：storeName（不帶 = 登入門市）或 allProducts（全部商品）。 */
  scope?: ProductStoreScope;
}

/** 庫存頁商品清單：關鍵字、門市清單與庫存狀況都在後端篩選，分頁載入。 */
export function useProductList(options: ProductListOptions = {}) {
  const [keyword, setKeyword] = useState('');
  // 停止輸入 300ms 後才查詢；切換門市立即生效。
  const searchKeyword = useDebouncedValue(keyword);
  const storeName = useSessionStore((state) => state.storeName);
  const stockKey = JSON.stringify(options.stockFilters ?? {});
  const scopeKey = JSON.stringify(storeScopeParams(options.scope));
  const paged = usePagedProducts(
    {
      keyword: searchKeyword,
      ...(JSON.parse(stockKey) as ProductSearchParams),
      ...(JSON.parse(scopeKey) as ProductStoreScope),
    },
    { enabled: options.enabled, refreshKey: storeName }
  );

  // 剛建立、還沒出現在已載入頁面裡的商品固定顯示在最前面，讓它的初始庫存草稿看得到、存得到。
  const [pinned, setPinned] = useState<Product[]>([]);
  useEffect(() => {
    setPinned([]);
  }, [searchKeyword, stockKey, scopeKey]);

  const pinProduct = useCallback((product: Product) => {
    setPinned((current) => [product, ...current.filter((row) => row.id !== product.id)]);
  }, []);

  const { reload: reloadPages } = paged;
  const reload = useCallback(async () => {
    try {
      const refreshPinned = Promise.all(pinned.map((product) => productService.getProductById(product.id)));
      await reloadPages();
      const fresh = await refreshPinned;
      setPinned(fresh.filter((product): product is Product => product !== null));
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, [pinned, reloadPages]);

  const keepVisible = options.keepVisible;
  const products = useMemo(() => {
    const loaded = new Map(paged.items.map((product) => [product.id, product]));
    const extra: Product[] = [];
    const seen = new Set<string>();
    for (const product of [...pinned, ...(keepVisible ?? [])]) {
      if (loaded.has(product.id) || seen.has(product.id)) continue;
      seen.add(product.id);
      extra.push(product);
    }
    return [...extra, ...paged.items];
  }, [pinned, keepVisible, paged.items]);

  return {
    keyword,
    setKeyword,
    products,
    total: paged.total,
    hasMore: paged.hasMore,
    isLoading: paged.isLoading,
    isLoadingMore: paged.isLoadingMore,
    loadMore: paged.loadMore,
    reload,
    pinProduct,
  };
}
