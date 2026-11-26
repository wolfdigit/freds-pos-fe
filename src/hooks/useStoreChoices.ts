import { useEffect, useState } from 'react';
import { systemService } from '@/services';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import type { StoreDto } from '@/types/system';
import { useSessionStore } from '@/store/sessionStore';

/**
 * 所有門市（GET /auth/stores，任何登入帳號都可以讀），給庫存頁的門市按鈕與地點排序、日報表的門市按鈕用。
 * 讀不到時是空陣列：庫存頁仍有「登入門市」與「全部商品」，日報表仍有「登入門市」與「所有門市總計」。
 */
export function useStoreChoices(service: ISystemService = systemService): { stores: StoreDto[]; loaded: boolean } {
  const storeName = useSessionStore((state) => state.storeName);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    service
      .listStoreChoices()
      .then((rows) => {
        if (cancelled) return;
        setStores(Array.isArray(rows) ? rows : []);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStores([]);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [storeName, service]);

  return { stores, loaded };
}
