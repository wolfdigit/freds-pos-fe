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
 * - unknown：查不到結果（斷線、逾時等），不阻擋結帳，交給後端判斷
 */
export type CartProductAvailability = 'available' | 'missing' | 'delisted' | 'unknown';

export function isDelistedProduct(product: Pick<Product, 'status' | 'deleted'>): boolean {
  return product.deleted === true || product.status === 'deleted';
}

export interface ProductSearchParams {
  keyword?: string;
  scale?: ModelScale | 'ALL' | string;
  brand?: string | 'ALL';
  /** 只留 totalInventory > 0 的商品。 */
  inInventoryOnly?: boolean;
}

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
