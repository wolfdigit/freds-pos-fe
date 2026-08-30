import type { StockLocation } from './product';

/** 跨據點庫存調撥請求 */
export interface InventoryTransferRequest {
  productId: string;
  fromLocation: StockLocation;
  toLocation: StockLocation;
  quantity: number;
  reason?: string;
  operatorId?: string;
}

/** 手動調整庫存請求 */
export interface StockAdjustRequest {
  productId: string;
  location: StockLocation;
  newQuantity: number;
  reason: string;
}

export interface StockLocationChange {
  location: StockLocation;
  locationName: string;
  oldQty: number;
  newQty: number;
  diff: number;
}

export interface StockItemAdjustment {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  changes: StockLocationChange[];
  summaryText: string;
}

export interface BatchStockAdjustRequest {
  adjustments: StockItemAdjustment[];
  operatorName: string;
  timestamp: string;
  note?: string;
}

export interface StockAdjustmentLog {
  id: string;
  timestamp: string;
  operatorName: string;
  items: StockItemAdjustment[];
  totalQtyChange: number;
  note?: string;
}

