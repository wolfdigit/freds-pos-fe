import type { ISystemService } from '@/services/interfaces/ISystemService';
import type {
  StoreDto,
  CreateStoreRequest,
  DeleteStoreResponse,
  UpdateStoreStockLocationRequest,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
} from '@/types/system';
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

  async updateStoreStockLocation(
    storeName: string,
    request: UpdateStoreStockLocationRequest
  ): Promise<StoreDto> {
    return httpClient.put<StoreDto>(
      `/system/stores/${encodeURIComponent(storeName)}/stock-location`,
      request
    );
  }

  async listAccounts(): Promise<OAuthAccountDto[]> {
    const data = await httpClient.get<OAuthAccountDto[]>('/system/oauth/accounts');
    return data || [];
  }

  async createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto> {
    return httpClient.post<OAuthAccountDto>('/system/oauth/accounts', request);
  }

  async updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto> {
    return httpClient.put<OAuthAccountDto>(
      `/system/oauth/accounts/${encodeURIComponent(email)}`,
      request
    );
  }

  async deleteAccount(email: string): Promise<void> {
    await httpClient.delete(`/system/oauth/accounts/${encodeURIComponent(email)}`);
  }
}
