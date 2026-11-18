import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
  LocationStockSummary,
} from '@/types/inventory';
import type { Product } from '@/types/product';
import { summarizeLocationStock } from '@/services/stockSummary';
import { ApiError, httpClient } from './httpClient';
import { invalidateStoreAndLocationCaches, locationList } from './sharedCaches';

export { LOCATIONS_TTL_MS, invalidateLocations } from './sharedCaches';

export class HttpLocationService implements ILocationService {
  async getLocations(options?: { fresh?: boolean }): Promise<InventoryLocationDto[]> {
    // 庫存頁、會員頁同時掛載多個 useLocations；短時間內共用同一次 /inventory/locations。
    const rows = await locationList.get(options);
    return rows.map((location) => ({
      ...location,
      storeNames: [...location.storeNames],
      returnedStoreNames: [...location.returnedStoreNames],
    }));
  }

  async getStockSummary(): Promise<LocationStockSummary[]> {
    try {
      return await httpClient.get<LocationStockSummary[]>('/inventory/locations/summary', { silentToast: true });
    } catch (err) {
      // 後端還沒部署 summary API（舊版回 404/405）時，退回原本抓全部商品自己加總。
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        const [locations, products] = await Promise.all([
          this.getLocations(),
          httpClient.get<Product[]>('/products'),
        ]);
        return summarizeLocationStock(locations, products || []);
      }
      throw err;
    }
  }

  async createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto> {
    try {
      return await httpClient.post<InventoryLocationDto>('/inventory/locations', location);
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }

  async updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto> {
    try {
      return await httpClient.put<InventoryLocationDto>(`/inventory/locations/${encodeURIComponent(id)}`, data);
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }

  async deleteLocation(
    id: string,
    request: DeleteInventoryLocationRequest
  ): Promise<DeleteInventoryLocationResponse> {
    try {
      // 刪除庫存點可能把門市改綁到別的庫存點，門市與庫存點的共用結果都要作廢。
      return await httpClient.delete<DeleteInventoryLocationResponse>(
        `/inventory/locations/${encodeURIComponent(id)}`,
        request.rebindToLocation ? { rebindToLocation: request.rebindToLocation } : {}
      );
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }
}
