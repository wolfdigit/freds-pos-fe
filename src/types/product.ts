export type ModelScale = '1:18' | '1:43' | '1:64' | '1:24' | '1:12' | '配件周邊';

export type StockLocation = string;

export interface LocationInventory {
  location: StockLocation;
  locationName: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  normalizedSku: string;
  barcode: string;
  brand: string;
  name: string;
  scale?: ModelScale | string;
  spec?: string;
  imageUrl?: string;
  listPrice: number;
  /** 每個地點一筆。缺列讀成 0，數量可以是負數。 */
  inventories: LocationInventory[];
  /** 所有地點加總，含倉庫、退貨地點與負數。 */
  totalInventory: number;
  /** 登入門市正常貨地點的數量。沒有選定門市時是 null，不是 0。 */
  loginStoreQuantity: number | null;
  /** 登入門市退貨地點的數量。沒有選定門市時是 null，不是 0。 */
  loginStoreReturnedQuantity: number | null;
  /** 登入門市預購保留地點的數量。沒有選定門市時是 null。舊資料可能沒有這個欄位。 */
  loginStorePreorderQuantity?: number | null;
  /**
   * 登入門市是否販售此商品。沒有選定門市時是 null；販售全部商品的門市一律 true。
   * 舊版後端沒有這個欄位（undefined），視為販售。
   */
  soldInLoginStore?: boolean | null;
  note?: string;
  /** 後端回傳的商品狀態。已下架的商品只能退貨，不能再賣。 */
  status?: string;
  deleted?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * 購物車商品在後端的狀態。
 * - available：可以結帳
 * - missing：後端回 PRODUCT_NOT_FOUND，商品已不存在
 * - delisted：商品已下架，只能退貨不能賣
 * - notInStore：登入門市沒有販售這個商品（不在門市商品清單），只能退貨不能賣
 * - unknown：查不到結果（斷線、逾時等），不阻擋結帳，交給後端判斷
 */
export type CartProductAvailability = 'available' | 'missing' | 'delisted' | 'notInStore' | 'unknown';

export function isDelistedProduct(product: Pick<Product, 'status' | 'deleted'>): boolean {
  return product.deleted === true || product.status === 'deleted';
}

/** 只有後端明確回 false 才算沒販售；null（沒有登入門市）與 undefined（舊版後端）都不擋。 */
export function isNotSoldInLoginStore(product: Pick<Product, 'soldInLoginStore'>): boolean {
  return product.soldInLoginStore === false;
}

/** 結帳前購物車商品的狀態：已下架優先，其次是本門市未販售。 */
export function productAvailability(
  product: Pick<Product, 'status' | 'deleted' | 'soldInLoginStore'>
): CartProductAvailability {
  if (isDelistedProduct(product)) return 'delisted';
  if (isNotSoldInLoginStore(product)) return 'notInStore';
  return 'available';
}

export interface ProductSearchParams {
  keyword?: string;
  scale?: ModelScale | 'ALL' | string;
  brand?: string | 'ALL';
  /** 只留 totalInventory > 0 的商品。 */
  inInventoryOnly?: boolean;
  /** loginStoreQuantity（登入門市正常庫存點）下限／上限，含等號。沒有選定門市時一律不符合。 */
  loginStoreQuantityMin?: number;
  loginStoreQuantityMax?: number;
  /** 搭配 locationQuantityMin/Max：指定庫存點的數量下限／上限，含等號。 */
  locationId?: string;
  locationQuantityMin?: number;
  locationQuantityMax?: number;
  /** totalInventory 下限／上限，含等號。 */
  totalInventoryMin?: number;
  totalInventoryMax?: number;
  /** 僅管理員：不套用登入門市的商品清單，列出全部商品。 */
  allProducts?: boolean;
}

/** 數量篩選的參數名稱（送給後端時照這個順序）。 */
export const STOCK_FILTER_KEYS = [
  'loginStoreQuantityMin',
  'loginStoreQuantityMax',
  'locationId',
  'locationQuantityMin',
  'locationQuantityMax',
  'totalInventoryMin',
  'totalInventoryMax',
] as const;

function within(value: number, min?: number, max?: number): boolean {
  return (min === undefined || value >= min) && (max === undefined || value <= max);
}

/**
 * 在前端套用數量篩選，規則跟後端一樣（沒有庫存列算 0）。
 * 只給 Mock 和「後端還不認得這些參數、回傳全部商品」時的備援用。
 */
export function matchesStockFilters(product: Product, params: ProductSearchParams): boolean {
  if (params.inInventoryOnly && !(product.totalInventory > 0)) return false;
  if (params.loginStoreQuantityMin !== undefined || params.loginStoreQuantityMax !== undefined) {
    if (typeof product.loginStoreQuantity !== 'number') return false;
    if (!within(product.loginStoreQuantity, params.loginStoreQuantityMin, params.loginStoreQuantityMax)) return false;
  }
  if (params.locationQuantityMin !== undefined || params.locationQuantityMax !== undefined) {
    const quantity = product.inventories?.find((row) => row.location === params.locationId)?.quantity ?? 0;
    if (!within(quantity, params.locationQuantityMin, params.locationQuantityMax)) return false;
  }
  return within(product.totalInventory ?? 0, params.totalInventoryMin, params.totalInventoryMax);
}

export function hasStockFilters(params: ProductSearchParams): boolean {
  return STOCK_FILTER_KEYS.some((key) => params[key] !== undefined && key !== 'locationId');
}

/** 分頁查詢：page 從 1 開始。 */
export interface ProductPageParams extends ProductSearchParams {
  page: number;
  pageSize: number;
}

/** GET /products 帶 page/pageSize 時的回應。total 是符合條件的總筆數。 */
export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
}

/** 商品清單與搜尋每頁筆數。 */
export const PRODUCT_PAGE_SIZE = 50;
/** 後端 pageSize 上限。 */
export const MAX_PRODUCT_PAGE_SIZE = 200;

export interface CreateProductRequest {
  sku: string;
  barcode: string;
  brand: string;
  name: string;
  scale?: ModelScale | string;
  spec?: string;
  imageUrl?: string;
  listPrice: number;
  note?: string;
}

export interface UpdateProductRequest {
  sku?: string;
  barcode?: string;
  brand?: string;
  name?: string;
  scale?: ModelScale | string;
  spec?: string;
  imageUrl?: string;
  listPrice?: number;
  note?: string;
}

export function inventoryQuantity(product: Pick<Product, 'inventories'> | null | undefined, locationId: string): number {
  if (!product || !locationId) return 0;
  return product.inventories.find((row) => row.location === locationId)?.quantity ?? 0;
}

/** 沒有登入門市時後端給 null。不要把 null 顯示成 0。 */
export function formatLoginStoreQuantity(value: number | null | undefined): string {
  return typeof value === 'number' ? String(value) : '—';
}

/** null 代表還沒有登入門市，不是缺貨，也不拿來擋結帳。 */
export function exceedsLoginStoreQuantity(requested: number, available: number | null | undefined): boolean {
  return typeof available === 'number' && requested > available;
}
