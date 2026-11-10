import { useState, useEffect, useCallback } from 'react';
import { errorMessage } from '@/auth/businessError';
import type { InventoryLocationDto } from '@/types/inventory';
import { locationService } from '@/services';

export function useLocations() {
  const [locations, setLocations] = useState<InventoryLocationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await locationService.getLocations();
      const sorted = (data || []).slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      setLocations(sorted);
    } catch (err) {
      console.error('Failed to load locations from API', err);
      setLocations([]);
      setError(errorMessage(err, '無法讀取庫存點'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadLocations();
  }, [reloadLocations]);

  return { locations, isLoading, error, reloadLocations };
}
