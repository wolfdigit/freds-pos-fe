import { useCallback, useEffect, useRef, useState } from 'react';
import type { Customer } from '@/types/customer';
import { customerService } from '@/services';
import { useUiStore } from '@/store/uiStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLatestRequest } from '@/hooks/useLatestRequest';

export function useCustomerSearch() {
  const [keyword, setKeywordState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCustomerId, setSelectedCustomerId } = useUiStore();
  const [selectedId, setSelectedIdState] = useState<string | null>(selectedCustomerId);
  // 停止輸入 300ms 後才查詢，舊的回應不會蓋掉新的結果。
  const searchKeyword = useDebouncedValue(keyword);
  const { begin, isLatest } = useLatestRequest();
  const customersRef = useRef<Customer[]>([]);
  const hasLoadedRef = useRef(false);

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
      const requestId = begin();
      setIsLoading(true);
      try {
        const res = await customerService.searchCustomers({ keyword: searchKeyword, page, pageSize });
        if (!isLatest(requestId)) return;
        customersRef.current = res.items;
        hasLoadedRef.current = true;
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
      } catch (err) {
        if (isLatest(requestId)) console.error(err);
      } finally {
        if (isLatest(requestId)) setIsLoading(false);
      }
    },
    [searchKeyword, page, pageSize, selectedId, selectedCustomerId, begin, isLatest]
  );

  // 讓下面的 effect 用最新的 reload，又只在指定條件改變時觸發。
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    if (selectedCustomerId !== selectedId) {
      setSelectedIdState(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    void reloadRef.current();
  }, [searchKeyword, page, pageSize]);

  // 點選列表裡已有的會員不必重抓整份列表；只有外部帶入（例如網址）不在目前列表的會員才重抓。
  useEffect(() => {
    if (!hasLoadedRef.current || !selectedCustomerId) return;
    if (customersRef.current.some((c) => c.id === selectedCustomerId)) return;
    void reloadRef.current();
  }, [selectedCustomerId]);

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
    isLoading,
    selectedId,
    setSelectedId: selectCustomer,
    reload,
  };
}
