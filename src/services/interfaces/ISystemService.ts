import type {
  StoreDto,
  CreateStoreRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
} from '@/types/system';

export interface ISystemService {
  /** 取得所有門市分店清單 (對應 GET /system/stores) */
  getStores(): Promise<StoreDto[]>;

  /** 新增門市分店 (對應 POST /system/stores) */
  createStore(request: CreateStoreRequest): Promise<StoreDto>;

  /** 刪除門市分店 (對應 DELETE /system/stores/{storeName}) */
  deleteStore(storeName: string): Promise<DeleteStoreResponse>;

  /** 白名單 (對應 /system/oauth/accounts，僅管理員) */
  listAccounts(): Promise<OAuthAccountDto[]>;
  createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto>;
  updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto>;
  deleteAccount(email: string): Promise<void>;
}
