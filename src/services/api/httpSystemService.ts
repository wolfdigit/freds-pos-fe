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

/** /system/stores 的共用快取時間。設定頁與庫存頁短時間內重複讀取時共用同一份結果。 */
export const STORE_RECORDS_TTL_MS = 30_000;

interface StoreRecordsEntry {
  token: string;
  fetchedAt: number;
  request: Promise<StoreDto[]>;
}

let storeRecords: StoreRecordsEntry | null = null;

/** 門市或庫存點綁定有變動時呼叫，下一次讀取會重新向後端查詢。 */
export function invalidateStoreRecords(): void {
  storeRecords = null;
}

function loadStoreRecords(fresh: boolean): Promise<StoreDto[]> {
  const token = localStorage.getItem('AUTH_TOKEN') ?? '';
  const cached = storeRecords;
  if (
    !fresh &&
    cached &&
    cached.token === token &&
    Date.now() - cached.fetchedAt < STORE_RECORDS_TTL_MS
  ) {
    return cached.request;
  }
  const entry: StoreRecordsEntry = {
    token,
    fetchedAt: Date.now(),
    request: httpClient.get<StoreDto[]>('/system/stores').then((data) => data || []),
  };
  storeRecords = entry;
  // 失敗的結果不留在快取裡，下一次會重試。
  entry.request.catch(() => {
    if (storeRecords === entry) storeRecords = null;
  });
  return entry.request;
}

export class HttpSystemService implements ISystemService {
  async getStores(options?: { fresh?: boolean }): Promise<StoreDto[]> {
    const rows = await loadStoreRecords(options?.fresh === true);
    return rows.map((row) => ({ ...row }));
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    try {
      return await httpClient.post<StoreDto>('/system/stores', request);
    } finally {
      invalidateStoreRecords();
    }
  }

  async rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto> {
    try {
      return await httpClient.put<StoreDto>(`/system/stores/${encodeURIComponent(storeName)}`, request);
    } finally {
      invalidateStoreRecords();
    }
  }

  async deleteStore(storeName: string): Promise<DeleteStoreResponse> {
    try {
      return await httpClient.delete<DeleteStoreResponse>(`/system/stores/${encodeURIComponent(storeName)}`);
    } finally {
      invalidateStoreRecords();
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
