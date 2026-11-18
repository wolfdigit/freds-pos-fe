import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { productService } from '@/services';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function useProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 停止輸入 300ms 後才查詢；品牌切換立即生效。
  const searchKeyword = useDebouncedValue(keyword);

  useEffect(() => {
    // cancelled 讓較早送出、較晚回來的舊結果不會蓋掉最新結果。
    let cancelled = false;
    setIsLoading(true);
    productService
      .searchProducts({ keyword: searchKeyword, brand })
      .then((products) => {
        if (!cancelled) setResults(products);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to search products:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchKeyword, brand]);

  return { keyword, setKeyword, brand, setBrand, results, isLoading };
}
