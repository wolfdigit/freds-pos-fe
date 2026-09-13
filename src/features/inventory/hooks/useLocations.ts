import { useState, useEffect, useCallback } from 'react';
import type { StockLocationDto } from '@/types/inventory';
import { locationService } from '@/services';

export function useLocations() {
  const [locations, setLocations] = useState<StockLocationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getLocations();
      const sorted = (data || []).slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      setLocations(sorted);
    } catch (err) {
      console.error('Failed to load locations from API', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadLocations();
  }, [reloadLocations]);

  return { locations, isLoading, reloadLocations };
}
