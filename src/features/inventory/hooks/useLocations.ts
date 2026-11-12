import { useState, useEffect, useCallback } from 'react';
import { errorMessage } from '@/auth/businessError';
import type { InventoryLocationDto } from '@/types/inventory';
import { locationService } from '@/services';
import { subscribeLocationCatalog } from '../locationCatalog';

export function useLocations() {
  const [locations, setLocations] = useState<InventoryLocationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadLocations = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await locationService.getLocations();
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
    void reloadLocations();
  }, [reloadLocations]);

  useEffect(() => {
    return subscribeLocationCatalog(() => {
      void reloadLocations({ silent: true });
    });
  }, [reloadLocations]);

  return { locations, isLoading, error, reloadLocations };
}
