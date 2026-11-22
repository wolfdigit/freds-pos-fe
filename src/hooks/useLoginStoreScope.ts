import { useEffect, useState } from 'react';
import { systemService } from '@/services';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import { useSessionStore } from '@/store/sessionStore';
import { storeProductScope, type StoreProductScope } from '@/types/system';

/**
 * 目前登入門市的販售範圍。沒有登入門市或還沒讀到時是 null。
 * 讀不到門市清單時也回 null：畫面只是不顯示提示，商品清單仍由後端決定。
 */
export function useLoginStoreScope(service: ISystemService = systemService): StoreProductScope | null {
  const storeName = useSessionStore((state) => state.storeName);
  const [scope, setScope] = useState<StoreProductScope | null>(null);

  useEffect(() => {
    const name = storeName.trim();
    if (!name) {
      setScope(null);
      return;
    }
    let cancelled = false;
    service
      .listStoreChoices()
      .then((stores) => {
        if (cancelled) return;
        const store = stores.find((row) => row.name === name);
        setScope(store ? storeProductScope(store) : null);
      })
      .catch(() => {
        if (!cancelled) setScope(null);
      });
    return () => {
      cancelled = true;
    };
  }, [storeName, service]);

  return scope;
}
