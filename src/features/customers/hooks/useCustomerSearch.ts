import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '@/types/customer';
import { customerService } from '@/services';
import { useUiStore } from '@/store/uiStore';

export function useCustomerSearch() {
  const [keyword, setKeywordState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { selectedCustomerId, setSelectedCustomerId } = useUiStore();
  const [selectedId, setSelectedIdState] = useState<string | null>(selectedCustomerId);

  const setKeyword = useCallback((val: string) => {
    setKeywordState(val);
    setPage(1);
  }, []);

  const selectCustomer = useCallback(
    (id: string | null) => {
      setSelectedIdState(id);
      setSelectedCustomerId(id);
    },
    [setSelectedCustomerId]
  );

  const reload = useCallback(
    async (targetId?: string) => {
      const res = await customerService.searchCustomers({ keyword, page, pageSize });
      setCustomers(res.items);
      setTotal(res.total);
      const activeTarget = targetId ?? selectedCustomerId;

      if (activeTarget && res.items.some((c) => c.id === activeTarget)) {
        setSelectedIdState(activeTarget);
      } else if (!selectedId && res.items.length > 0) {
        const defaultId = res.items[0].id;
        setSelectedIdState(defaultId);
      } else if (selectedId && !res.items.some((c) => c.id === selectedId)) {
        const fallbackId = res.items[0]?.id ?? null;
        setSelectedIdState(fallbackId);
      }
    },
    [keyword, page, pageSize, selectedId, selectedCustomerId]
  );

  useEffect(() => {
    if (selectedCustomerId !== selectedId) {
      setSelectedIdState(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    reload();
  }, [keyword, page, pageSize, selectedCustomerId]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    keyword,
    setKeyword,
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    customers,
    selectedId,
    setSelectedId: selectCustomer,
    reload,
  };
}

