import type {
  StoreDto,
  CreateStoreRequest,
  UpdateStoreBindingRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
} from '@/types/system';

export interface ISystemService {
  /** 取得所有門市分店清單 (對應 GET /system/stores) */
  getStores(): Promise<StoreDto[]>;

  /** 新增門市。正常貨與退貨地點都必填，可以是同一個地點。 */
  createStore(request: CreateStoreRequest): Promise<StoreDto>;

  /** 改綁門市的兩個庫存地點。僅管理員。 */
  rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto>;

  /** 刪除門市分店 (對應 DELETE /system/stores/{storeName}) */
  deleteStore(storeName: string): Promise<DeleteStoreResponse>;

  /** 使用者管理 (對應 /system/oauth/accounts，僅管理員) */
  listAccounts(): Promise<OAuthAccountDto[]>;
  createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto>;
  updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto>;
  deleteAccount(email: string): Promise<void>;
}
