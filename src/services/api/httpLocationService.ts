import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  StockLocationDto,
  CreateStockLocationRequest,
  UpdateStockLocationRequest,
  DeleteStockLocationRequest,
  DeleteStockLocationResponse,
} from '@/types/inventory';
import { httpClient } from './httpClient';

export class HttpLocationService implements ILocationService {
  async getLocations(): Promise<StockLocationDto[]> {
    const data = await httpClient.get<StockLocationDto[]>('/inventory/locations');
    return (data || []).slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  async createLocation(location: CreateStockLocationRequest): Promise<StockLocationDto> {
    return httpClient.post<StockLocationDto>('/inventory/locations', location);
  }

  async updateLocation(id: string, data: UpdateStockLocationRequest): Promise<StockLocationDto> {
    return httpClient.put<StockLocationDto>(`/inventory/locations/${encodeURIComponent(id)}`, data);
  }

  async deleteLocation(id: string, request: DeleteStockLocationRequest): Promise<DeleteStockLocationResponse> {
    return httpClient.delete<DeleteStockLocationResponse>(
      `/inventory/locations/${encodeURIComponent(id)}`,
      request
    );
  }
}
