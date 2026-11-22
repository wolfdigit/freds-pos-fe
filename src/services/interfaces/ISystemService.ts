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

export interface ISystemService {
  /**
   * 取得所有門市分店清單 (對應 GET /system/stores)。
   * HTTP 版會短暫共用最近一次結果；fresh: true 會略過共用結果直接重新查詢。
   */
  getStores(options?: { fresh?: boolean }): Promise<StoreDto[]>;

  /** 新增門市。正常貨與退貨地點都必填，可以是同一個地點。 */
  createStore(request: CreateStoreRequest): Promise<StoreDto>;

  /** 改綁門市的兩個庫存地點。僅管理員。 */
  rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto>;

  /** 刪除門市分店 (對應 DELETE /system/stores/{storeName}) */
  deleteStore(storeName: string): Promise<DeleteStoreResponse>;

  /**
   * 任何登入使用者都能讀的門市清單（GET /auth/stores），含 productScope。
   * 店員用它挑要編輯商品清單的門市、判斷登入門市是否只賣清單商品。
   */
  listStoreChoices(options?: { fresh?: boolean }): Promise<StoreDto[]>;

  /** 切換門市販售範圍 all / list。一般店員也可以切換。 */
  setStoreProductScope(storeName: string, productScope: StoreProductScope): Promise<StoreDto>;

  /** 門市商品清單勾選畫面：搜尋整個商品目錄（後端分頁），每筆標示是否已加入。一般店員也可以用。 */
  listStoreProducts(storeName: string, query: StoreProductQuery): Promise<StoreProductPage>;
  /** 勾選畫面「存檔」：加入與移出一次送出（POST .../products/batch），同一個交易套用。 */
  saveStoreProducts(storeName: string, request: StoreProductBatchRequest): Promise<StoreProductChangeResult>;
  /** 從另一間門市複製清單。replace: true 會移除來源沒有的商品。 */
  copyStoreProducts(storeName: string, request: CopyStoreProductsRequest): Promise<StoreProductChangeResult>;

  /** 使用者管理 (對應 /system/oauth/accounts，僅管理員) */
  listAccounts(): Promise<OAuthAccountDto[]>;
  createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto>;
  updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto>;
  deleteAccount(email: string): Promise<void>;
}
