import type { ISystemService } from '@/services/interfaces/ISystemService';
import type {
  StoreDto,
  CreateStoreRequest,
  UpdateStoreBindingRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
} from '@/types/system';
import { httpClient } from './httpClient';
import { invalidateStoreAndLocationCaches, storeRecords } from './sharedCaches';

export { STORE_RECORDS_TTL_MS, invalidateStoreRecords } from './sharedCaches';

export class HttpSystemService implements ISystemService {
  async getStores(options?: { fresh?: boolean }): Promise<StoreDto[]> {
    const rows = await storeRecords.get(options);
    return rows.map((row) => ({ ...row }));
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    try {
      return await httpClient.post<StoreDto>('/system/stores', request);
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }

  async rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto> {
    try {
      return await httpClient.put<StoreDto>(`/system/stores/${encodeURIComponent(storeName)}`, request);
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }

  async deleteStore(storeName: string): Promise<DeleteStoreResponse> {
    try {
      return await httpClient.delete<DeleteStoreResponse>(`/system/stores/${encodeURIComponent(storeName)}`);
    } finally {
      invalidateStoreAndLocationCaches();
    }
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
