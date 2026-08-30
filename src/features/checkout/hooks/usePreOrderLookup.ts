import { useState } from 'react';
import type { PreOrder } from '@/types/preorder';
import { preOrderService } from '@/services';

export function usePreOrderLookup() {
  const [phone, setPhone] = useState('');
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (query: string) => {
    setPhone(query);
    if (!query.trim()) {
      setPreOrders([]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await preOrderService.getPendingPreOrders(query);
      setPreOrders(results);
    } finally {
      setIsLoading(false);
    }
  };

  return { phone, preOrders, isLoading, search };
}
