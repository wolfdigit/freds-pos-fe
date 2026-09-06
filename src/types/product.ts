export type ModelScale = '1:18' | '1:43' | '1:64' | '1:24' | '1:12' | '配件周邊';

export type StockLocation = 'store' | 'warehouse' | 'company' | 'other';

export interface LocationStock {
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
  scale: ModelScale;
  spec?: string;
  imageUrl?: string;
  listPrice: number;
  stocks: LocationStock[];
  totalStock: number;
  preOrderPendingCount: number;
  note?: string;
}

export interface ProductSearchParams {
  keyword?: string;
  scale?: ModelScale | 'ALL';
  brand?: string | 'ALL';
  inStockOnly?: boolean;
}

export interface CreateProductRequest {
  sku: string;
  barcode: string;
  brand: string;
  name: string;
  scale: ModelScale;
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
  scale?: ModelScale;
  spec?: string;
  imageUrl?: string;
  listPrice?: number;
  note?: string;
}

