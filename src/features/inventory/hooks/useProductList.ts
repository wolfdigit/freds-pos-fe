import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { productService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLatestRequest } from '@/hooks/useLatestRequest';

export function useProductList() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 停止輸入 300ms 後才查詢；品牌切換立即生效。
  const searchKeyword = useDebouncedValue(keyword);
  const { begin, isLatest } = useLatestRequest();

  const storeName = useSessionStore((state) => state.storeName);
  const reload = useCallback(async () => {
    const requestId = begin();
    setIsLoading(true);
    try {
      const results = await productService.searchProducts({ keyword: searchKeyword, brand });
      if (isLatest(requestId)) setProducts(results);
    } finally {
      if (isLatest(requestId)) setIsLoading(false);
    }
  }, [searchKeyword, brand, begin, isLatest]);

  useEffect(() => {
    void reload().catch((err) => console.error('Failed to load products:', err));
  }, [reload, storeName]);

  return { keyword, setKeyword, brand, setBrand, products, isLoading, reload };
}
