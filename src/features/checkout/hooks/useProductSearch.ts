import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { productService } from '@/services';

export function useProductSearch() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    productService
      .searchProducts({ keyword, brand })
      .then((products) => {
        if (!cancelled) setResults(products);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [keyword, brand]);

  return { keyword, setKeyword, brand, setBrand, results, isLoading };
}
