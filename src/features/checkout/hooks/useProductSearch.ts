import { useCallback, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePagedProducts } from '@/hooks/usePagedProducts';
import { useSessionStore } from '@/store/sessionStore';

export function useProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  // 停止輸入 300ms 後才查詢；品牌切換立即生效。
  const searchKeyword = useDebouncedValue(keyword);
  // 一次只抓一頁，「載入更多」再接下一頁；較晚回來的舊結果不會蓋掉最新結果。
  // 換登入門市時重查：只販售清單商品的門市，搜尋結果不同。
  const storeName = useSessionStore((state) => state.storeName);
  const { items, total, hasMore, isLoading, isLoadingMore, loadMore, resultFilters } = usePagedProducts(
    {
      keyword: searchKeyword,
      brand,
    },
    { refreshKey: storeName }
  );

  /**
   * 畫面上的結果是不是「這個關鍵字（與目前品牌）」查出來的。
   * 還在等 debounce 或查詢中時回 false，按 Enter 不能拿舊結果。
   */
  const resultsMatch = useCallback(
    (query: string) =>
      resultFilters !== null &&
      (resultFilters.keyword ?? '').trim() === query.trim() &&
      (resultFilters.brand ?? 'ALL') === brand,
    [resultFilters, brand]
  );

  return {
    keyword,
    setKeyword,
    /** 目前生效（已送出查詢）的關鍵字。 */
    searchKeyword,
    brand,
    setBrand,
    results: items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    resultsMatch,
  };
}
