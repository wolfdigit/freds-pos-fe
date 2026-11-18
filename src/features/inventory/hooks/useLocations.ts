import { useState, useEffect, useCallback } from 'react';
import { errorMessage } from '@/auth/businessError';
import type { InventoryLocationDto } from '@/types/inventory';
import { locationService } from '@/services';
import { subscribeLocationCatalog } from '../locationCatalog';

export function useLocations() {
  const [locations, setLocations] = useState<InventoryLocationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 明確呼叫（重新整理、重試、寫入後）預設重新查詢；
   * 掛載時與收到庫存點變更通知時用共用結果，同頁多個元件只打一次 /inventory/locations。
   */
  const reloadLocations = useCallback(async (options?: { silent?: boolean; fresh?: boolean }) => {
    const silent = options?.silent === true;
    const fresh = options?.fresh !== false;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await locationService.getLocations({ fresh });
      const sorted = (data || []).slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      setLocations(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load locations from API', err);
      if (!silent) setLocations([]);
      setError(errorMessage(err, '無法讀取庫存點'));
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadLocations({ fresh: false });
  }, [reloadLocations]);

  useEffect(() => {
    return subscribeLocationCatalog(() => {
      // invalidateLocationCatalog 已先作廢共用結果，第一個元件重抓，其餘共用同一次請求。
      void reloadLocations({ silent: true, fresh: false });
    });
  }, [reloadLocations]);

  return { locations, isLoading, error, reloadLocations };
}
