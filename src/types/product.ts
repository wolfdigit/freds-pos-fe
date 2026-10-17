export type ModelScale = '1:18' | '1:43' | '1:64' | '1:24' | '1:12' | '配件周邊';

export type StockLocation = 'store' | 'warehouse' | 'company' | 'other' | string;

export interface LocationStock {
  location: StockLocation;
  locationName: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string; // SKU (貨號)
  normalizedSku: string;
  barcode: string; // Barcode (國際條碼)
  brand: string; // Brand (品牌)
  name: string; // Item_Name (品名)
  scale?: ModelScale | string; // 模型比例 (1:64, 1:43, 1:18 等)
  spec?: string; // 規格 / 版本說明
  imageUrl?: string;
  listPrice: number; // 門市定價 / 建議售價 (即試算表 MSRP)
  stocks: LocationStock[];
  totalStock: number;
  note?: string; // 備註 (Note)
  createdAt?: string; // 建檔時間
  createdBy?: string; // 建檔人員 (Auth)
  updatedAt?: string; // 更新時間
  updatedBy?: string; // 更新人員 (Auth)
}

export interface ProductSearchParams {
  keyword?: string;
  scale?: ModelScale | 'ALL' | string;
  brand?: string | 'ALL';
  inStockOnly?: boolean;
}

export interface CreateProductRequest {
  sku: string;
  barcode: string;
  brand: string;
  name: string;
  scale?: ModelScale | string;
  spec?: string;
  imageUrl?: string;
  listPrice: number; // 建議售價 (即試算表 MSRP)
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
  listPrice?: number; // 建議售價 (即試算表 MSRP)
  note?: string;
}
