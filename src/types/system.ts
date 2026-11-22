/**
 * 門市販售範圍。
 * - all：販售全部商品（預設，既有門市不變）
 * - list：只販售門市商品清單裡的商品
 */
export type StoreProductScope = 'all' | 'list';

export interface StoreDto {
  name: string;
  isDefault?: boolean;
  inventoryLocationId: string;
  inventoryLocationName: string;
  returnedInventoryLocationId: string;
  returnedInventoryLocationName: string;
  /** 預購保留：會員來門市取預購時，預購取貨的列從這裡扣。 */
  preorderInventoryLocationId: string;
  preorderInventoryLocationName: string;
  /** 舊版後端沒有這個欄位，視為 all。 */
  productScope?: StoreProductScope;
}

export function storeProductScope(store: Pick<StoreDto, 'productScope'> | null | undefined): StoreProductScope {
  return store?.productScope === 'list' ? 'list' : 'all';
}

export interface CreateStoreRequest {
  name: string;
  inventoryLocationId: string;
  returnedInventoryLocationId: string;
  /** 省略時後端用系統地點「預購保留」。 */
  preorderInventoryLocationId?: string;
  productScope?: StoreProductScope;
}

/** 門市商品清單編輯畫面的一列：商品目錄的一筆商品，附上是否已在清單。 */
export interface StoreProductItem {
  productId: string;
  sku: string;
  barcode: string;
  brand: string;
  name: string;
  scale?: string | null;
  listPrice: number;
  imageUrl?: string | null;
  inList: boolean;
  /** 加入時間（後端時間）。不在清單時為 null。 */
  addedAt?: string | null;
  /** 加入者（後端登入身分的顯示名稱）。不在清單時為 null。 */
  addedBy?: string | null;
}

export interface StoreProductQuery {
  keyword?: string;
  /** true：只看已加入；false：只看未加入；不給：全部。 */
  inList?: boolean;
  page: number;
  pageSize: number;
}

export interface StoreProductPage {
  storeName: string;
  productScope: StoreProductScope;
  /** 清單內未刪除的商品數，不受搜尋條件影響。 */
  listedTotal: number;
  items: StoreProductItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CopyStoreProductsRequest {
  sourceStoreName: string;
  /** true：也移除來源門市沒有的商品。 */
  replace?: boolean;
}

/** 勾選畫面按「存檔」一次送出的變更。同一個交易套用；同一商品不能同時出現在兩邊。 */
export interface StoreProductBatchRequest {
  add: string[];
  remove: string[];
}

/** 一次存檔最多變更的商品數（加入 + 移出），與後端一致。 */
export const STORE_PRODUCT_BATCH_MAX = 2000;

export interface StoreProductChangeResult {
  storeName: string;
  productScope: StoreProductScope;
  /** 實際新增加上實際移除的筆數。 */
  changed: number;
  /** 實際新增筆數（舊版後端可能沒有）。 */
  added?: number;
  /** 實際移除筆數（舊版後端可能沒有）。 */
  removed?: number;
  listedTotal: number;
}

/** 門市商品清單每頁筆數。 */
export const STORE_PRODUCT_PAGE_SIZE = 50;

export interface UpdateStoreBindingRequest {
  inventoryLocationId: string;
  returnedInventoryLocationId: string;
  /** 省略時維持原本的預購保留綁定。 */
  preorderInventoryLocationId?: string;
}

export interface DeleteStoreResponse {
  success: boolean;
  deletedStore: string;
}

export interface OAuthAccountDto {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  note?: string | null;
}

export interface CreateOAuthAccountRequest {
  email: string;
  role: string;
  name: string;
  note?: string | null;
}

export interface UpdateOAuthAccountRequest {
  role?: string;
  name?: string | null;
  note?: string | null;
}
