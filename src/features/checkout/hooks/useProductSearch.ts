import { useState } from 'react';
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
  const { items, total, hasMore, isLoading, isLoadingMore, loadMore } = usePagedProducts(
    {
      keyword: searchKeyword,
      brand,
    },
    { refreshKey: storeName }
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
  };
}
