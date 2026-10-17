import type { ISystemService } from '@/services/interfaces/ISystemService';
import type { StoreDto, CreateStoreRequest, DeleteStoreResponse } from '@/types/system';
import { httpClient } from './httpClient';

export class HttpSystemService implements ISystemService {
  async getStores(): Promise<StoreDto[]> {
    const data = await httpClient.get<StoreDto[]>('/system/stores');
    return data || [];
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    return httpClient.post<StoreDto>('/system/stores', request);
  }

  async deleteStore(storeName: string): Promise<DeleteStoreResponse> {
    return httpClient.delete<DeleteStoreResponse>(`/system/stores/${encodeURIComponent(storeName)}`);
  }
}
