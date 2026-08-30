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
  material?: string;
  color?: string;
  imageUrl?: string;
  listPrice: number;
  costPrice: number;
  vipPrice?: number;
  stocks: LocationStock[];
  totalStock: number;
  preOrderPendingCount: number;
  note?: string;
  status: 'active' | 'discontinued';
}

export interface ProductSearchParams {
  keyword?: string;
  scale?: ModelScale | 'ALL';
  brand?: string | 'ALL';
  inStockOnly?: boolean;
}
