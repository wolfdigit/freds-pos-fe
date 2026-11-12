import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
} from '@/types/inventory';
import { httpClient } from './httpClient';

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
    return httpClient.post<InventoryLocationDto>('/inventory/locations', location);
  }

  async updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto> {
    return httpClient.put<InventoryLocationDto>(`/inventory/locations/${encodeURIComponent(id)}`, data);
  }

  async deleteLocation(
    id: string,
    request: DeleteInventoryLocationRequest
  ): Promise<DeleteInventoryLocationResponse> {
    return httpClient.delete<DeleteInventoryLocationResponse>(
      `/inventory/locations/${encodeURIComponent(id)}`,
      request.rebindToLocation ? { rebindToLocation: request.rebindToLocation } : {}
    );
  }
}
