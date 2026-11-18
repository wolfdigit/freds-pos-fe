import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
} from '@/types/inventory';
import { httpClient } from './httpClient';
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
