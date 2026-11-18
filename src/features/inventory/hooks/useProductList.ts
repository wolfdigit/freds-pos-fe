import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { productService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagedProducts } from '@/hooks/usePagedProducts';

/**
 * 庫存頁商品清單。預設分頁載入；fullList 為 true 時（低庫存、缺貨等只能在前端判斷的篩選）一次抓全部。
 */
export function useProductList(options: { fullList?: boolean } = {}) {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  // 停止輸入 300ms 後才查詢；品牌切換立即生效。
  const searchKeyword = useDebouncedValue(keyword);
  const storeName = useSessionStore((state) => state.storeName);
  const paged = usePagedProducts(
    { keyword: searchKeyword, brand },
    { fullList: options.fullList, refreshKey: storeName }
  );

  // 剛建立、還沒出現在已載入頁面裡的商品固定顯示在最前面，讓它的初始庫存草稿看得到、存得到。
  const [pinned, setPinned] = useState<Product[]>([]);
  useEffect(() => {
    setPinned([]);
  }, [searchKeyword, brand, options.fullList]);

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

  const products = useMemo(() => {
    const loaded = new Set(paged.items.map((product) => product.id));
    return [...pinned.filter((product) => !loaded.has(product.id)), ...paged.items];
  }, [pinned, paged.items]);

  return {
    keyword,
    setKeyword,
    brand,
    setBrand,
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
