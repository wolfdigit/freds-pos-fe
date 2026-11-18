import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
} from '@/types/inventory';
import { httpClient } from './httpClient';
import { invalidateStoreRecords } from './httpSystemService';

export class HttpLocationService implements ILocationService {
  async getLocations(): Promise<InventoryLocationDto[]> {
    const data = await httpClient.get<InventoryLocationDto[]>('/inventory/locations');
    return (data || []).map((location) => ({
      ...location,
      storeNames: location.storeNames ?? [],
      returnedStoreNames: location.returnedStoreNames ?? [],
    })).slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  async createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto> {
    try {
      return await httpClient.post<InventoryLocationDto>('/inventory/locations', location);
    } finally {
      invalidateStoreRecords();
    }
  }

  async updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto> {
    try {
      return await httpClient.put<InventoryLocationDto>(`/inventory/locations/${encodeURIComponent(id)}`, data);
    } finally {
      invalidateStoreRecords();
    }
  }

  async deleteLocation(
    id: string,
    request: DeleteInventoryLocationRequest
  ): Promise<DeleteInventoryLocationResponse> {
    try {
      // 刪除庫存點可能把門市改綁到別的庫存點，門市快取要一起作廢。
      return await httpClient.delete<DeleteInventoryLocationResponse>(
        `/inventory/locations/${encodeURIComponent(id)}`,
        request.rebindToLocation ? { rebindToLocation: request.rebindToLocation } : {}
      );
    } finally {
      invalidateStoreRecords();
    }
  }
}
