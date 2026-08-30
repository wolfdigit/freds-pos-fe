import { useCallback, useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import { productService } from '@/services';

export function useProductList() {
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string | 'ALL'>('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await productService.searchProducts({ keyword, brand });
      setProducts(results);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, brand]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { keyword, setKeyword, brand, setBrand, products, isLoading, reload };
}

