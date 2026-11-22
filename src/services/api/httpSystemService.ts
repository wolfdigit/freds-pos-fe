import type { ISystemService } from '@/services/interfaces/ISystemService';
import type {
  StoreDto,
  CreateStoreRequest,
  UpdateStoreBindingRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
  StoreProductScope,
  StoreProductQuery,
  StoreProductPage,
  StoreProductBatchRequest,
  StoreProductChangeResult,
  CopyStoreProductsRequest,
} from '@/types/system';
import { loadLoginStores } from '@/auth/storePrefetch';
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

  async listStoreChoices(options?: { fresh?: boolean }): Promise<StoreDto[]> {
    const rows = await loadLoginStores(options);
    return rows.map((row) => ({ ...row }));
  }

  async setStoreProductScope(storeName: string, productScope: StoreProductScope): Promise<StoreDto> {
    try {
      return await httpClient.put<StoreDto>(`/system/stores/${encodeURIComponent(storeName)}/product-scope`, {
        productScope,
      });
    } finally {
      invalidateStoreAndLocationCaches();
    }
  }

  async listStoreProducts(storeName: string, query: StoreProductQuery): Promise<StoreProductPage> {
    const params = new URLSearchParams();
    const keyword = query.keyword?.trim();
    if (keyword) params.set('keyword', keyword);
    if (query.inList !== undefined) params.set('inList', String(query.inList));
    params.set('page', String(query.page));
    params.set('pageSize', String(query.pageSize));
    return httpClient.get<StoreProductPage>(
      `/system/stores/${encodeURIComponent(storeName)}/products?${params.toString()}`
    );
  }

  async saveStoreProducts(storeName: string, request: StoreProductBatchRequest): Promise<StoreProductChangeResult> {
    return httpClient.post<StoreProductChangeResult>(
      `/system/stores/${encodeURIComponent(storeName)}/products/batch`,
      { add: request.add, remove: request.remove }
    );
  }

  async copyStoreProducts(storeName: string, request: CopyStoreProductsRequest): Promise<StoreProductChangeResult> {
    return httpClient.post<StoreProductChangeResult>(
      `/system/stores/${encodeURIComponent(storeName)}/products/copy`,
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
