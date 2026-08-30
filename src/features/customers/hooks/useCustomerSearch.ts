import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '@/types/customer';
import { customerService } from '@/services';
import { useUiStore } from '@/store/uiStore';

export function useCustomerSearch() {
  const [keyword, setKeyword] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { selectedCustomerId, setSelectedCustomerId } = useUiStore();
  const [selectedId, setSelectedIdState] = useState<string | null>(selectedCustomerId);

  const selectCustomer = useCallback(
    (id: string | null) => {
      setSelectedIdState(id);
      setSelectedCustomerId(id);
    },
    [setSelectedCustomerId]
  );

  const reload = useCallback(
    async (targetId?: string) => {
      const results = await customerService.searchCustomers(keyword);
      setCustomers(results);
      const activeTarget = targetId ?? selectedCustomerId;

      if (activeTarget && results.some((c) => c.id === activeTarget)) {
        setSelectedIdState(activeTarget);
      } else if (!selectedId && results.length > 0) {
        const defaultId = results[0].id;
        setSelectedIdState(defaultId);
      } else if (selectedId && !results.some((c) => c.id === selectedId)) {
        const fallbackId = results[0]?.id ?? null;
        setSelectedIdState(fallbackId);
      }
    },
    [keyword, selectedId, selectedCustomerId]
  );

  useEffect(() => {
    if (selectedCustomerId !== selectedId) {
      setSelectedIdState(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    reload();
  }, [keyword, selectedCustomerId]);

  return { keyword, setKeyword, customers, selectedId, setSelectedId: selectCustomer, reload };
}

